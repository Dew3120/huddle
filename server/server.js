import express from 'express';
import { config } from './config.js';

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
  });
});

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
