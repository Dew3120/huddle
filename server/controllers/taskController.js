import * as taskService from '../services/taskService.js';

export function list(req, res) {
  const result = taskService.listTasks(req.query);

  res.json(result);
}

export function getOne(req, res) {
  const task = taskService.getTaskById(req.params.id);

  if (!task) {
    return res.status(404).json({
      error: {
        message: 'Task not found',
        code: 'TASK_NOT_FOUND',
        requestId: req.id,
      },
    });
  }

  return res.json({
    data: task,
  });
}
