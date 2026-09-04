import 'dotenv/config';

const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET;
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const mongoUri = process.env.MONGODB_URI;

if (!Number.isInteger(port) || port <= 0) {
  throw new Error('PORT must be a positive integer.');
}

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required.');
}

if (!mongoUri) {
  throw new Error('MONGODB_URI is required.');
}

export const config = {
  port,
  jwtSecret,
  clientOrigin,
  mongoUri,
  jwtExpiresIn: '1h',
};
