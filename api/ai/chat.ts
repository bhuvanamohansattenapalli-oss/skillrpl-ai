import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoogleGenAI } from '@google/genai';

// RPL Coaching and safety system instruction
const RPL_SYSTEM_INSTRUCTION = `You are the SkillRPL AI Assistant, an empathetic and knowledgeable AI mentor dedicated to guiding informal and experienced workers through India's Recognition of Prior Learning (RPL) process.

CORE OBJECTIVE:
Guide workers to understand how their existing practical experience maps to formal skills, qualifications, and the National Skills Qualification Framework (NSQF). Help them build self-confidence, identify their competencies, and prepare high-quality evidence portfolios for assessment by authorized human assessors.

CRITICAL RPL BOUNDARIES (MANDATORY):
1. You CANNOT officially assess, declare competence, or certify any worker. Only authorized human RPL assessors can evaluate and certify candidates.
2. Clearly state that your suggestions, skill mappings, and qualification matches are advisory and designed to help workers prepare for their official assessment.
3. Encourage workers to document genuine workplace experience through photos, work samples, employer vouchers, and logbooks.
4. Keep explanations simple, encouraging, jargon-free, and respectful of manual tradecraft and informal apprenticeships.`;

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

function sendJsonResponse(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.end(JSON.stringify(data));
}

function parseRequestBody(req: IncomingMessage, maxBytes = 100_000): Promise<any> {
  if ((req as any).body !== undefined && (req as any).body !== null) {
    const existingBody = (req as any).body;
    if (typeof existingBody === 'object') return Promise.resolve(existingBody);
    if (typeof existingBody === 'string') {
      if (!existingBody.trim()) return Promise.resolve({});
      try {
        return Promise.resolve(JSON.parse(existingBody));
      } catch {
        const err = new Error('Malformed JSON payload.') as Error & { status?: number };
        err.status = 400;
        return Promise.reject(err);
      }
    }
  }

  if ((req as any).readableEnded || (req as any).complete) {
    return Promise.resolve({});
  }

  return new Promise((resolve, reject) => {
    let rawData = '';
    let totalBytes = 0;

    req.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        const err = new Error('Payload too large.') as Error & { status?: number };
        err.status = 413;
        reject(err);
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
        resolve(JSON.parse(rawData));
      } catch {
        const err = new Error('Malformed JSON payload.') as Error & { status?: number };
        err.status = 400;
        reject(err);
      }
    });

    req.on('error', (err) => reject(err));
  });
}

function logSafeDiagnostic(params: {
  status: number;
  errorName: string;
  errorCode: string;
  errorMessage: string;
  route: string;
  model: string;
}) {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  const databaseConfigured = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('PASTE_'));

  const safeMsg = params.errorMessage
    .replace(/key=[^&\s"']+/gi, 'key=[REDACTED]')
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_KEY]')
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[REDACTED_DB_URL]');

  console.error(
    `[SERVER_DIAGNOSTIC] status=${params.status} | name=${params.errorName} | code=${params.errorCode} | model=${params.model} | GEMINI_API_KEY_configured=${geminiConfigured} | DATABASE_URL_configured=${databaseConfigured} | route=${params.route} | message=${safeMsg}`
  );
}

let geminiClientInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  if (!geminiClientInstance) {
    geminiClientInstance = new GoogleGenAI({ apiKey });
  }
  return geminiClientInstance;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const route = '/api/ai/chat';
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.6-flash';

  if (req.method !== 'POST') {
    sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use POST.' });
    return;
  }

  if (!checkRateLimit()) {
    sendJsonResponse(res, 429, {
      success: false,
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      error: 'AI request limit reached. Please wait a moment and try again.'
    });
    return;
  }

  let rawBody: any;
  try {
    rawBody = await parseRequestBody(req);
  } catch (err: any) {
    sendJsonResponse(res, err?.status || 400, { success: false, error: err?.message || 'Invalid request body' });
    return;
  }

  const message = typeof rawBody?.message === 'string' ? rawBody.message.trim() : '';
  if (!message) {
    sendJsonResponse(res, 400, { success: false, error: 'Message is required.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    logSafeDiagnostic({
      status: 503,
      errorName: 'ConfigurationError',
      errorCode: 'KEY_MISSING',
      errorMessage: 'GEMINI_API_KEY is not configured in server environment.',
      route,
      model
    });
    sendJsonResponse(res, 503, {
      success: false,
      status: 503,
      name: 'ConfigurationError',
      code: 'KEY_MISSING',
      model,
      geminiConfigured: false,
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      route,
      error: 'AI Assistant service is not configured. Please ensure GEMINI_API_KEY is set.'
    });
    return;
  }

  // Format multi-turn conversation history
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  if (Array.isArray(rawBody?.history)) {
    const recent = rawBody.history.slice(-8);
    for (const h of recent) {
      if (h?.content && typeof h.content === 'string') {
        const text = h.content.trim();
        if (text) {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text }]
          });
        }
      }
    }
  }
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const modelsToTry = [model, 'gemini-3.5-flash', 'gemini-flash-latest'].filter(
    (m, idx, arr) => arr.indexOf(m) === idx
  );

  let replyText: string | undefined;
  let lastError: any = null;

  try {
    const ai = getGeminiClient();

    for (const currentModel of modelsToTry) {
      const maxAttempts = currentModel === model ? 2 : 1;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: currentModel,
            contents,
            config: {
              systemInstruction: RPL_SYSTEM_INSTRUCTION,
              temperature: 0.65,
              maxOutputTokens: 2048
            }
          });
          replyText = response.text?.trim();
          if (replyText) break;
        } catch (error: any) {
          lastError = error;
          const errMsg = error?.message || String(error);
          const isQuota = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota');
          const isTransient = errMsg.includes('503') || errMsg.includes('UNAVAILABLE');
          if (isQuota) break;
          if (isTransient && attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 1200));
            continue;
          }
          break;
        }
      }
      if (replyText) break;
    }

    if (replyText) {
      sendJsonResponse(res, 200, { success: true, message: replyText });
      return;
    }

    throw lastError || new Error('No response returned by Gemini model.');
  } catch (err: any) {
    const statusCode = err?.status || err?.statusCode || 500;
    const errorName = err?.name || 'Error';
    const errorCode = err?.code || (statusCode === 429 ? 'RATE_LIMIT_EXCEEDED' : 'GEMINI_ERROR');
    const rawMessage = err instanceof Error ? err.message : String(err);
    const safeMessage = rawMessage
      .replace(/key=[^&\s"']+/gi, 'key=[REDACTED]')
      .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_KEY]')
      .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[REDACTED_DB_URL]');

    logSafeDiagnostic({
      status: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
      errorName,
      errorCode,
      errorMessage: safeMessage,
      route,
      model
    });

    sendJsonResponse(res, statusCode >= 400 && statusCode < 600 ? statusCode : 500, {
      success: false,
      status: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
      name: errorName,
      code: errorCode,
      model,
      geminiConfigured: true,
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      route,
      error: safeMessage
    });
  }
}
