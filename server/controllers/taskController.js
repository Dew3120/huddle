import * as taskService from '../services/taskService.js';

export function list(req, res) {
  const result = taskService.listTasks(req.query);

  res.json(result);
}

export function getOne(req, res) {
  const task = taskService.getTaskById(req.params.id);

  res.json({
    data: task,
  });
}

export function create(req, res) {
  const task = taskService.createTask(req.body);

  res
    .status(201)
    .location(`/api/tasks/${task.id}`)
    .json({
      data: task,
    });
}

export function update(req, res) {
  const task = taskService.updateTask(req.params.id, req.body);

  res.json({
    data: task,
  });
}

export function remove(req, res) {
  taskService.deleteTask(req.params.id);

  res.status(204).end();
}
