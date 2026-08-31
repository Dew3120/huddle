import { randomUUID } from 'node:crypto';
import * as taskRepository from '../repositories/taskRepository.js';
import { NotFoundError } from '../utils/AppError.js';
import { publicTask, queryTaskCollection } from '../utils/taskCollection.js';

export function listTasks(query = {}, user) {
  return queryTaskCollection(taskRepository.findAllByOwner(user.id), query);
}

export function getTaskById(id, user) {
  const task = taskRepository.findByIdForOwner(id, user.id);

  if (!task) {
    throw new NotFoundError('Task');
  }

  return publicTask(task);
}

export function createTask(taskInput, user) {
  const task = {
    id: randomUUID(),
    ...taskInput,
    ownerId: user.id,
  };

  return publicTask(taskRepository.create(task));
}

export function updateTask(id, updates, user) {
  const task = taskRepository.updateForOwner(id, user.id, updates);

  if (!task) {
    throw new NotFoundError('Task');
  }

  return publicTask(task);
}

export function deleteTask(id, user) {
  const wasDeleted = taskRepository.removeForOwner(id, user.id);

  if (!wasDeleted) {
    throw new NotFoundError('Task');
  }
}
