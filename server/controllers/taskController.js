import * as taskService from '../services/taskService.js';

export async function list(req, res) {
  const result = await taskService.listTasks(req.validated.query, req.user);

  res.json(result);
}

export async function getOne(req, res) {
  const task = await taskService.getTaskById(req.params.id, req.user);

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

export async function update(req, res) {
  const task = await taskService.updateTask(req.params.id, req.body, req.user);

  res.json({
    data: task,
  });
}

export async function remove(req, res) {
  await taskService.deleteTask(req.params.id, req.user);

  res.status(204).end();
}
