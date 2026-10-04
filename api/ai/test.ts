import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoogleGenAI } from '@google/genai';

function sendJsonResponse(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.end(JSON.stringify(data));
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

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const route = '/api/ai/test';
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.6-flash';

  if (req.method !== 'GET') {
    sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed. Use GET.' });
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
      error: 'GEMINI_API_KEY is not configured in environment.'
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
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
  } catch (err: any) {
    const status = err?.status || err?.statusCode || 500;
    const errorName = err?.name || 'Error';
    const code = err?.code || (status === 429 ? 'RESOURCE_EXHAUSTED' : status === 404 ? 'NOT_FOUND' : status === 401 ? 'UNAUTHENTICATED' : 'ERROR');
    const rawMsg = err?.message || String(err);
    const safeMsg = rawMsg
      .replace(/key=[^&\s]+/gi, 'key=[REDACTED]')
      .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_KEY]')
      .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[REDACTED_DB_URL]');

    logSafeDiagnostic({
      status: status >= 400 && status < 600 ? status : 500,
      errorName,
      errorCode: code,
      errorMessage: safeMsg,
      route,
      model
    });

    sendJsonResponse(res, status >= 400 && status < 600 ? status : 500, {
      success: false,
      status: status >= 400 && status < 600 ? status : 500,
      name: errorName,
      code,
      model,
      geminiConfigured: true,
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      route,
      error: safeMsg
    });
  }
}
