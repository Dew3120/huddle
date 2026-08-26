import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestId } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();

app.use(helmet());
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
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
