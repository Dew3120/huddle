import * as taskService from '../services/taskService.js';

export function list(req, res) {
  const result = taskService.listTasks(req.validated.query, req.user);

  res.json(result);
}

export function getOne(req, res) {
  const task = taskService.getTaskById(req.params.id, req.user);

  res.json({
    data: task,
  });
}

export async function create(req, res) {
  const task = await taskService.createTask(req.body, req.user);

  res
    .status(201)
    .location(`/api/tasks/${task.id}`)
    .json({
      data: task,
    });
}

export function update(req, res) {
  const task = taskService.updateTask(req.params.id, req.body, req.user);

  res.json({
    data: task,
  });
}

export function remove(req, res) {
  taskService.deleteTask(req.params.id, req.user);

  res.status(204).end();
}
