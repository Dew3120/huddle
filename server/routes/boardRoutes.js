import { Router } from 'express';
import * as controller from '../controllers/boardController.js';
import { validate } from '../middleware/validate.js';
import { createBoardSchema } from '../schemas/boardSchema.js';
import { taskQuerySchema } from '../schemas/taskSchema.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(controller.list));
router.post('/', validate(createBoardSchema), asyncHandler(controller.create));
router.get(
  '/:id/tasks',
  validate(taskQuerySchema, 'query'),
  asyncHandler(controller.listTasks),
);

export default router;
