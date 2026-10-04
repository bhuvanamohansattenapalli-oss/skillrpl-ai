import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApiRoute } from '../src/server/api.ts';
import { getGeminiModel, isGeminiConfigured } from '../src/lib/ai/gemini.ts';
import { isDatabaseConfigured } from '../src/lib/db.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const route = req.url || '/api';
  try {
    const handled = await handleApiRoute(req, res);
    if (!handled) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ success: false, status: 404, code: 'NOT_FOUND', error: 'API route not found' }));
    }
  } catch (err: any) {
    const status = err?.status || err?.statusCode || 500;
    const errorName = err?.name || 'Error';
    const code = err?.code || 'SERVER_ERROR';
    const rawMsg = err?.message || String(err) || 'Internal server error';
    const safeMsg = rawMsg
      .replace(/key=[^&\s"']+/gi, 'key=[REDACTED]')
      .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_KEY]')
      .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[REDACTED_DB_URL]');

    const model = getGeminiModel();
    const geminiConfigured = isGeminiConfigured();
    const databaseConfigured = isDatabaseConfigured();

    console.error(
      `[SERVER_DIAGNOSTIC] status=${status} | name=${errorName} | code=${code} | model=${model} | GEMINI_API_KEY_configured=${geminiConfigured} | DATABASE_URL_configured=${databaseConfigured} | route=${route} | message=${safeMsg}`
    );

    res.statusCode = status >= 400 && status < 600 ? status : 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({
      success: false,
      status: res.statusCode,
      name: errorName,
      code,
      model,
      geminiConfigured,
      databaseConfigured,
      route,
      error: safeMsg
    }));
  }
}

