const express = require('express');
const cors = require('cors');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'huddle-api',
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

module.exports = app;