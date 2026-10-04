import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateRplChatResponse } from '../lib/ai/rpl-assistant.ts';
import { isGeminiConfigured, getGeminiModel } from '../lib/ai/gemini.ts';
import { chatRequestSchema, type ChatApiResponse, type HealthResponse } from '../lib/ai/types.ts';

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

  // 2. Chat endpoint: POST /api/ai/chat
  if (pathname === '/api/ai/chat') {
    if (req.method !== 'POST') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use POST.' });
      return true;
    }

    try {
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
      const sanitizedMessage =
        err instanceof Error ? err.message : 'AI Assistant is temporarily unavailable. Please try again.';

      // Determine appropriate status code
      let statusCode = 500;
      if (sanitizedMessage.includes('quota') || sanitizedMessage.includes('rate limit')) {
        statusCode = 429;
      } else if (sanitizedMessage.includes('not configured')) {
        statusCode = 503;
      }

      sendJsonResponse(res, statusCode, {
        success: false,
        error: sanitizedMessage
      } as ChatApiResponse);
      return true;
    }
  }

  return false;
}
