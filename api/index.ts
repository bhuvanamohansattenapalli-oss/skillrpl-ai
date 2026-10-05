import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApiRoute } from '../src/server/api.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const handled = await handleApiRoute(req, res);
    if (handled) return;
  } catch (error: any) {
    if (!res.writableEnded) {
      res.statusCode = error.status || 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ success: false, error: error.message || 'Internal server error.' }));
      return;
    }
  }

  if (!res.writableEnded) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ status: 'ok', message: 'SkillRPL AI API Gateway' }));
  }
}
