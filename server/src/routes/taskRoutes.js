const express = require('express');

const {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} = require('../controllers/taskController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(createTask);

router
  .route('/:id')
  .get(getTaskById)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;