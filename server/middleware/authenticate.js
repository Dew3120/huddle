import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import * as userRepository from '../repositories/userRepository.js';
import { UnauthorizedError } from '../utils/AppError.js';

export async function authenticate(req, res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Authentication required', 'NO_TOKEN'));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedError('Invalid token', 'BAD_TOKEN');
    }

    req.user = userRepository.publicUser(user);
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired', 'TOKEN_EXPIRED'));
    }

    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token', 'BAD_TOKEN'));
    }

    return next(err);
  }
}
