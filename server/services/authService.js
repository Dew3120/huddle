import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import * as userRepository from '../repositories/userRepository.js';
import { AppError, ConflictError } from '../utils/AppError.js';

export async function register({ email, password }) {
  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw new ConflictError('Email is already registered', 'EMAIL_EXISTS');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepository.create({ email, passwordHash });

  return userRepository.publicUser(user);
}

export async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'BAD_CREDENTIALS');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401, 'BAD_CREDENTIALS');
  }

  const token = jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    },
  );

  return {
    token,
    user: userRepository.publicUser(user),
  };
}
