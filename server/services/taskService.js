import { randomUUID } from 'node:crypto';
import * as boardRepository from '../repositories/boardRepository.js';
import * as taskRepository from '../repositories/taskRepository.js';
import { NotFoundError } from '../utils/AppError.js';
import { publicTask, queryTaskCollection } from '../utils/taskCollection.js';

async function findOrCreateDefaultBoard(user) {
  const existingBoard = await boardRepository.findFirstByOwner(user.databaseId);

  if (existingBoard) {
    return existingBoard;
  }

  return boardRepository.create({
    name: 'My Task Board',
    ownerId: user.databaseId,
    members: [{ userId: user.databaseId, role: 'owner' }],
    columns: [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Done', position: 2 },
    ],
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

export async function createTask(taskInput, user) {
  const board = await findOrCreateDefaultBoard(user);
  const boardId = board.toJSON().id;
  const task = {
    id: randomUUID(),
    ...taskInput,
    boardId,
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
