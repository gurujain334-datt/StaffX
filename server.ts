import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { aiRouter } from './src/server/aiRoutes';
import { seedRouter } from './src/server/seedRoutes';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Health check API for deployment container checks
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'EventFlex', timestamp: new Date().toISOString() });
  });

  // Mount AI routes
  app.use('/api/ai', aiRouter);

  // Fallback direct proxy for /api/chat compatibility
  app.post('/api/chat', (req, res, next) => {
    req.url = '/chat';
    aiRouter(req, res, next);
  });

  // Mount Secure Seeding routes
  app.use('/api/demo', seedRouter);

  // Serve static assets in production mode or mount Vite middleware in development
  const distPath = path.join(process.cwd(), 'dist');
  const hasBuildAssets = fs.existsSync(path.join(distPath, 'index.html'));

  const isProd = process.env.NODE_ENV === 'production' || 
                 !!process.env.K_SERVICE || 
                 (hasBuildAssets && process.env.npm_lifecycle_event !== 'dev');

  if (isProd && hasBuildAssets) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`StaffX production server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
