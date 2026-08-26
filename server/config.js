import 'dotenv/config';

const port = Number(process.env.PORT ?? 4000);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error('PORT must be a positive integer.');
}

export const config = {
  port,
};
