import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { authenticate } from './middleware/authenticate.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestId } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();

app.use(helmet());
app.use(requestId);
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(requestLogger);
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({
    data: {
      status: 'ok',
      uptime: process.uptime(),
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/boards', authenticate, boardRoutes);
app.use('/api/tasks', authenticate, taskRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;