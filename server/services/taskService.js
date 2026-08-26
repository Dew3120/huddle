import { randomUUID } from 'node:crypto';
import * as taskRepository from '../repositories/taskRepository.js';
import { NotFoundError } from '../utils/AppError.js';

const allowedSortFields = ['title', 'assignee', 'status', 'dueDate'];

export function listTasks({
  status,
  assignee,
  sort = 'dueDate',
  page = '1',
  limit = '20',
} = {}) {
  let result = taskRepository.findAll();

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
    data: result.slice(start, start + limitNumber),
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
    },
  };
}

export function getTaskById(id) {
  const task = taskRepository.findById(id);

  if (!task) {
    throw new NotFoundError('Task');
  }

  return task;
}

export function createTask(taskInput) {
  const task = {
    id: randomUUID(),
    ...taskInput,
  };

  return taskRepository.create(task);
}

export function updateTask(id, updates) {
  const task = taskRepository.update(id, updates);

  if (!task) {
    throw new NotFoundError('Task');
  }

  return task;
}

export function deleteTask(id) {
  const wasDeleted = taskRepository.remove(id);

  if (!wasDeleted) {
    throw new NotFoundError('Task');
  }
}
