import { randomUUID } from 'node:crypto';
import * as taskRepository from '../repositories/taskRepository.js';
import { NotFoundError } from '../utils/AppError.js';

const allowedSortFields = ['title', 'assignee', 'status', 'dueDate'];

function publicTask(task) {
  const { ownerId, ...taskData } = task;
  return taskData;
}

export function listTasks({
  status,
  assignee,
  sort = 'dueDate',
  page = '1',
  limit = '20',
} = {}, user) {
  let result = taskRepository.findAllByOwner(user.id);

  if (status) {
    result = result.filter((task) => task.status === status);
  }

  if (assignee) {
    result = result.filter((task) => task.assignee === assignee);
  }

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
  const sortDirection = sort.startsWith('-') ? -1 : 1;

  if (allowedSortFields.includes(sortField)) {
    result = [...result].sort(
      (first, second) =>
        String(first[sortField]).localeCompare(String(second[sortField])) *
        sortDirection,
    );
  }

  const total = result.length;
  const start = (pageNumber - 1) * limitNumber;

  return {
    data: result.slice(start, start + limitNumber).map(publicTask),
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
    },
  };
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
