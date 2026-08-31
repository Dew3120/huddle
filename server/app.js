import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { config } from './config.js';
import { authenticate } from './middleware/authenticate.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestId } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { openApiDocument } from './openapi.js';

const app = express();

app.use(requestId);
app.use(requestLogger);
app.use(
  '/api/docs',
  helmet({
    contentSecurityPolicy: {
      directives: {
        imgSrc: ["'self'", 'data:'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }),
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: 'Huddle API Reference',
    customCss: '.swagger-ui .topbar { display: none; }',
  }),
);
app.use(helmet());
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({
    data: {
      status: 'ok',
      uptime: process.uptime(),
    },
  });
});

app.get('/api/openapi.json', (req, res) => {
  res.json(openApiDocument);
});

app.use('/api/auth', authRoutes);
app.use('/api/boards', authenticate, boardRoutes);
app.use('/api/tasks', authenticate, taskRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
