import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controller from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../schemas/authSchema.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many login attempts', 429, 'RATE_LIMITED'));
  },
});

router.post('/register', validate(registerSchema), asyncHandler(controller.register));
router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(controller.login));
router.get('/me', authenticate, asyncHandler(controller.me));

export default router;
