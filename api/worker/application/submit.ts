import type { IncomingMessage, ServerResponse } from 'node:http';
import handler from '../application';

export default async function submitHandler(req: IncomingMessage, res: ServerResponse) {
  // Delegate directly to the application handler with submit semantics
  (req as any).action = 'submit';
  return handler(req, res);
}
