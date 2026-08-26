import { tasks } from '../data/tasks.js';

export function list(req, res) {
  const { status } = req.query;

  const filteredTasks = status
    ? tasks.filter((task) => task.status === status)
    : tasks;

  res.json(filteredTasks);
}

export function getOne(req, res) {
  const { id } = req.params;
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return res.status(404).json({
      message: 'Task not found',
    });
  }

  return res.json(task);
}
