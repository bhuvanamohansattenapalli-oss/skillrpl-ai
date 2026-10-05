import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { handleApiRoute } from './src/server/api.js';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load process.env variables from .env.local and .env
  const env = loadEnv(mode, process.cwd(), '');
  for (const key in env) {
    if (env[key]) {
      process.env[key] = env[key];
    }
  }

  return {
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    plugins: [
      react(),
      {
        name: 'api-server-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && (req.url === '/api' || req.url.startsWith('/api/') || req.url.startsWith('/api?'))) {
              try {
                const handled = await handleApiRoute(req, res);
                if (handled) return;
              } catch (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
                return;
              }
            }
            next();
          });
        },
        configurePreviewServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && (req.url === '/api' || req.url.startsWith('/api/') || req.url.startsWith('/api?'))) {
              try {
                const handled = await handleApiRoute(req, res);
                if (handled) return;
              } catch (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
                return;
              }
            }
            next();
          });
        }
      }
    ]
  };
});
