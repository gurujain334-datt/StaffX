import express from 'express';
import { aiRouter } from '../src/server/aiRoutes';
import { seedRouter } from '../src/server/seedRoutes';

const app = express();
app.use(express.json());

// Mount the routes
app.use('/api/ai', aiRouter);
app.use('/api/demo', seedRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'EventFlex', timestamp: new Date().toISOString() });
});

export default app;
