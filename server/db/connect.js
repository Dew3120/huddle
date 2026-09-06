import dns from 'node:dns';
import mongoose from 'mongoose';
import { config } from '../config.js';
import { createMongoLookup } from './mongoLookup.js';

export async function connectDb() {
  mongoose.set('strictQuery', true);

  if (config.mongoDnsServers.length > 0) {
    dns.setServers(config.mongoDnsServers);
  }

  const lookup = createMongoLookup(config.mongoDnsServers);

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 15000,
    ...(lookup ? { lookup } : {}),
  });

  console.log('MongoDB connected');
}
