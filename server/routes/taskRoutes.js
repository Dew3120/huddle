import { Router } from 'express';
import * as controller from '../controllers/taskController.js';

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getOne);

export default router;
