import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateRplChatResponse } from '../lib/ai/rpl-assistant.ts';
import { isGeminiConfigured, getGeminiModel } from '../lib/ai/gemini.ts';
import { chatRequestSchema, skillAnalysisRequestSchema, type ChatApiResponse, type HealthResponse } from '../lib/ai/types.ts';
import { performSkillAnalysis } from '../lib/ai/skill-analysis.ts';


/**
 * Utility to send JSON responses with appropriate headers
 */
function sendJsonResponse(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.end(JSON.stringify(data));
}

/**
 * Helper to safely parse JSON body from incoming request stream
 */
function parseRequestBody(req: IncomingMessage, maxBytes = 100_000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let rawData = '';
    let totalBytes = 0;

    req.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        reject(new Error('Payload too large. Maximum 100KB allowed.'));
        req.destroy();
        return;
      }
      rawData += chunk;
    });

    req.on('end', () => {
      if (!rawData.trim()) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(rawData);
        resolve(parsed);
      } catch {
        reject(new Error('Malformed JSON payload.'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

// In-memory sliding window rate limiter: 15 requests per 60 seconds
const requestTimestamps: number[] = [];
const RATE_LIMIT_MAX_RPM = 15;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(): boolean {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] <= now - RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= RATE_LIMIT_MAX_RPM) {
    return false;
  }
  requestTimestamps.push(now);
  return true;
}

/**
 * Main API middleware handler for /api/* routes.
 * Returns true if the route was handled, false if next() should be called.
 */
export async function handleApiRoute(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  const parsedUrl = new URL(url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. Health check endpoint: GET /api/health
  if (pathname === '/api/health') {
    if (req.method !== 'GET') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use GET.' });
      return true;
    }

    let databaseStatus: 'connected' | 'disconnected' | 'not_configured' = 'not_configured';
    const dbUrl = process.env.DATABASE_URL?.trim();

    if (
      dbUrl &&
      !dbUrl.includes('PASTE_') &&
      (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'))
    ) {
      try {
        const { prisma } = await import('../lib/db.ts');
        await prisma.$queryRaw`SELECT 1`;
        databaseStatus = 'connected';
      } catch {
        databaseStatus = 'disconnected';
      }
    }

    const healthData: HealthResponse = {
      status: 'ok',
      database: databaseStatus,
      geminiConfigured: isGeminiConfigured(),
      model: getGeminiModel()
    };
    sendJsonResponse(res, 200, healthData);
    return true;
  }

  // 2. Safe Test Endpoint: GET /api/ai/test
  if (pathname === '/api/ai/test') {
    if (req.method !== 'GET') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use GET.' });
      return true;
    }

    const model = getGeminiModel();
    const isConfigured = isGeminiConfigured();

    if (!isConfigured) {
      console.error(`[Gemini Test] Status: 503 | Code: KEY_MISSING | Model: ${model} | KeyConfigured: false | Message: GEMINI_API_KEY is not configured.`);
      sendJsonResponse(res, 503, {
        success: false,
        status: 503,
        code: 'KEY_MISSING',
        model,
        error: 'GEMINI_API_KEY is not configured in environment.'
      });
      return true;
    }

    try {
      const { getGeminiClient } = await import('../lib/ai/gemini.ts');
      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model,
        contents: 'Respond with exactly: Gemini connection successful.'
      });

      const replyText = response.text?.trim() || 'Gemini connection successful.';

      sendJsonResponse(res, 200, {
        success: true,
        model,
        message: replyText
      });
      return true;
    } catch (err: any) {
      const status = err?.status || err?.statusCode || 500;
      const code = err?.code || (status === 429 ? 'RESOURCE_EXHAUSTED' : status === 404 ? 'NOT_FOUND' : status === 401 ? 'UNAUTHENTICATED' : 'ERROR');
      const rawMsg = err?.message || String(err);

      // Safe error extraction avoiding token or env leaks
      let safeMsg = 'Unknown Gemini API error';
      try {
        const parsed = JSON.parse(rawMsg.slice(rawMsg.indexOf('{')));
        safeMsg = parsed?.error?.message || rawMsg;
      } catch {
        safeMsg = rawMsg.replace(/key=[^&\s]+/gi, 'key=[REDACTED]');
      }

      // Safe server-side diagnostic logging (NEVER logs actual key, secrets, or full env)
      console.error(
        `[Gemini Diagnostic] Status: ${status} | Code: ${code} | Model: ${model} | KeyConfigured: ${isConfigured} | Error: ${safeMsg.slice(0, 300)}`
      );

      sendJsonResponse(res, status >= 400 && status < 600 ? status : 500, {
        success: false,
        status,
        code,
        model,
        error: safeMsg
      });
      return true;
    }
  }

  // 3. Chat endpoint: POST /api/ai/chat
  if (pathname === '/api/ai/chat') {
    if (req.method !== 'POST') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use POST.' });
      return true;
    }

    try {
      // 3.1 Rate limit check (15 RPM protection)
      if (!checkRateLimit()) {
        console.warn(`[Gemini Rate Limiter] 15 RPM limit reached. Returning 429.`);
        sendJsonResponse(res, 429, {
          success: false,
          status: 429,
          code: 'RATE_LIMIT_EXCEEDED',
          error: 'AI request limit reached. Please wait a moment and try again.'
        });
        return true;
      }

      const rawBody = await parseRequestBody(req);

      // Validate with Zod
      const parseResult = chatRequestSchema.safeParse(rawBody);

      if (!parseResult.success) {
        const firstIssue = parseResult.error.issues[0];
        const errorMessage = firstIssue ? `${firstIssue.path.join('.') || 'request'}: ${firstIssue.message}` : 'Invalid request format.';
        
        sendJsonResponse(res, 400, {
          success: false,
          error: errorMessage
        } as ChatApiResponse);
        return true;
      }

      // Check if Gemini is configured before calling
      if (!isGeminiConfigured()) {
        sendJsonResponse(res, 503, {
          success: false,
          error: 'AI Assistant service is not configured. Please ensure GEMINI_API_KEY is set.'
        } as ChatApiResponse);
        return true;
      }

      // Generate response using Gemini service
      const aiResponse = await generateRplChatResponse(parseResult.data);
      sendJsonResponse(res, 200, aiResponse);
      return true;
    } catch (err: any) {

      const statusCode = err?.status || 500;
      const errorCode = err?.code || 'GEMINI_ERROR';
      const errorMessage = err instanceof Error ? err.message : 'AI Assistant is temporarily unavailable. Please try again.';

      // Safe server logging
      console.error(
        `[Gemini Chat Error] Status: ${statusCode} | Code: ${errorCode} | Model: ${getGeminiModel()} | KeyConfigured: ${isGeminiConfigured()} | Message: ${errorMessage}`
      );

      sendJsonResponse(res, statusCode, {
        success: false,
        status: statusCode,
        code: errorCode,
        error: errorMessage
      } as ChatApiResponse & { status?: number; code?: string });
      return true;
    }
  }

  // 4. Skill Analysis endpoint: POST /api/ai/skill-analysis
  if (pathname === '/api/ai/skill-analysis') {
    if (req.method !== 'POST') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use POST.' });
      return true;
    }

    try {
      // Rate limit check (15 RPM protection)
      if (!checkRateLimit()) {
        console.warn(`[Skill Analysis Rate Limiter] 15 RPM limit reached. Returning 429.`);
        sendJsonResponse(res, 429, {
          success: false,
          status: 429,
          code: 'RATE_LIMIT_EXCEEDED',
          error: 'AI request limit reached. Please wait a moment and try again.'
        });
        return true;
      }

      const rawBody = await parseRequestBody(req);

      // Validate with Zod
      const parseResult = skillAnalysisRequestSchema.safeParse(rawBody);

      if (!parseResult.success) {
        const firstIssue = parseResult.error.issues[0];
        const errorMessage = firstIssue
          ? `${firstIssue.path.join('.') || 'request'}: ${firstIssue.message}`
          : 'Invalid request format.';

        sendJsonResponse(res, 400, {
          success: false,
          status: 400,
          code: 'INVALID_REQUEST',
          error: errorMessage
        });
        return true;
      }

      // Check if Gemini is configured
      if (!isGeminiConfigured()) {
        sendJsonResponse(res, 503, {
          success: false,
          status: 503,
          code: 'SERVICE_UNAVAILABLE',
          error: 'AI Assistant service is not configured. Please ensure GEMINI_API_KEY is set.'
        });
        return true;
      }

      // Execute AI Skill Analysis using dedicated Gemini 3.6 Flash service
      const analysisResult = await performSkillAnalysis(parseResult.data);

      sendJsonResponse(res, 200, {
        success: true,
        data: analysisResult,
        recordId: analysisResult.recordId
      });
      return true;
    } catch (err: any) {
      const statusCode = err?.status || 500;
      const errorCode = err?.code || 'ANALYSIS_ERROR';
      const errorMessage =
        err instanceof Error ? err.message : 'AI Skill Analysis is temporarily unavailable. Please try again.';

      console.error(
        `[Skill Analysis Error] Status: ${statusCode} | Code: ${errorCode} | Model: ${getGeminiModel()} | KeyConfigured: ${isGeminiConfigured()} | Message: ${errorMessage}`
      );

      sendJsonResponse(res, statusCode, {
        success: false,
        status: statusCode,
        code: errorCode,
        error: errorMessage
      });
      return true;
    }
  }

  return false;
}


