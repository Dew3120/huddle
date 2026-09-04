import app from './app.js';
import { config } from './config.js';
import { connectDb } from './db/connect.js';

try {
  await connectDb();

  app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });
} catch (error) {
  console.error(`MongoDB connection failed: ${error.message}`);
  process.exit(1);
}
