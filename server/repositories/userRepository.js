import mongoose from 'mongoose';
import { User } from '../models/User.js';

export async function findByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

export async function findById(id) {
  if (mongoose.isValidObjectId(id)) {
    return User.findById(id);
  }

  return User.findOne({ legacyId: id });
}

export async function create({ email, passwordHash }) {
  return User.create({
    email: email.toLowerCase(),
    passwordHash,
  });
}

export function publicUser(user) {
  const value = user.toObject ? user.toObject() : user;
  const publicValue = {
    id: value.legacyId ?? value._id.toString(),
    email: value.email,
  };

  if (value.name) {
    publicValue.name = value.name;
  }

  Object.defineProperty(publicValue, 'databaseId', {
    value: value._id.toString(),
    enumerable: false,
  });

  return publicValue;
}
