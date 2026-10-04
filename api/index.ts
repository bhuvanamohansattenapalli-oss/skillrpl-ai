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
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ success: false, status: 500, code: 'SERVER_ERROR', error: err?.message || 'Internal server error' }));
  }
}
