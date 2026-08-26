import express from 'express';
import { requestId } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();

app.use(express.json({ limit: '100kb' }));
app.use(requestId);
app.use(requestLogger);

app.get('/api/health', (req, res) => {
  res.json({
    data: {
      status: 'ok',
      uptime: process.uptime(),
    },
  });
});

app.use('/api/tasks', taskRoutes);

export default app;
