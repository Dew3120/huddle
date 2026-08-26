import { AppError, NotFoundError } from '../utils/AppError.js';

export function notFoundHandler(req, res, next) {
  next(new NotFoundError('Route'));
}

export function errorHandler(err, req, res, _next) {
  const fallbackStatus = Number.isInteger(err.status) ? err.status : 500;
  const status = fallbackStatus >= 400 && fallbackStatus < 600 ? fallbackStatus : 500;
  const isKnownError = err instanceof AppError || err.isOperational;

  if (status >= 500) {
    console.error(req.id, err);
  }

  const error = {
    message: status === 500 ? 'Something went wrong' : err.message,
    code: isKnownError ? err.code : 'BAD_REQUEST',
    requestId: req.id,
  };

  if (isKnownError && err.details) {
    error.details = err.details;
  }

  res.status(status).json({ error });
}
