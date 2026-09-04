import mongoose from 'mongoose';
import { NotFoundError } from './AppError.js';

export function assertResourceId(value, resource) {
  const legacyPattern = new RegExp(`^${resource.toLowerCase()}-\\d{3}$`);

  if (!mongoose.isValidObjectId(value) && !legacyPattern.test(value)) {
    throw new NotFoundError(resource);
  }
}
