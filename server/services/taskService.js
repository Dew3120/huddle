import { randomUUID } from 'node:crypto';
import * as boardRepository from '../repositories/boardRepository.js';
import * as taskRepository from '../repositories/taskRepository.js';
import { NotFoundError } from '../utils/AppError.js';
import { publicTask, queryTaskCollection } from '../utils/taskCollection.js';

function findOrCreateDefaultBoard(user) {
  const existingBoard = boardRepository.findFirstByOwner(user.id);

  if (existingBoard) {
    return existingBoard;
  }

  return boardRepository.create({
    id: randomUUID(),
    name: 'My Task Board',
    ownerId: user.id,
  });
}

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
  const board = findOrCreateDefaultBoard(user);
  const task = {
    id: randomUUID(),
    ...taskInput,
    boardId: board.id,
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
