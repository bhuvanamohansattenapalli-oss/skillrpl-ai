import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApiRoute } from '../src/server/api.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const handled = await handleApiRoute(req, res);
    if (!handled) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ success: false, status: 404, code: 'NOT_FOUND', error: 'API route not found' }));
    }
  } catch (err: any) {
    const status = err?.status || err?.statusCode || 500;
    const code = err?.code || 'SERVER_ERROR';
    const rawMsg = err?.message || String(err) || 'Internal server error';
    const safeMsg = rawMsg
      .replace(/key=[^&\s"']+/gi, 'key=[REDACTED]')
      .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_KEY]');

    console.error(`[Vercel Serverless Exception] Status: ${status} | Code: ${code} | Error: ${safeMsg}`);

    res.statusCode = status >= 400 && status < 600 ? status : 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({
      success: false,
      status: res.statusCode,
      code,
      error: safeMsg
    }));
  }
}
