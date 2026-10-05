import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApiRoute } from '../src/server/api.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const handled = await handleApiRoute(req, res);
    if (handled) return;

    if (!res.writableEnded) {
      const url = req.url || '';
      const parsedUrl = new URL(url, `http://${req.headers.host || 'localhost'}`);
      const route = parsedUrl.searchParams.get('__route') || parsedUrl.pathname;
      if (route === '/api' || route === '/api/' || route === '') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ status: 'ok', message: 'SkillRPL AI API Gateway' }));
        return;
      }

      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ success: false, error: 'API route not found.' }));
    }
  } catch (error: any) {
    if (!res.writableEnded) {
      res.statusCode = error.status || 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ success: false, error: error.message || 'Internal server error.' }));
      return;
    }
  }
}
