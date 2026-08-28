import { randomUUID } from 'node:crypto';
import * as boardRepository from '../repositories/boardRepository.js';
import * as taskRepository from '../repositories/taskRepository.js';
import { NotFoundError } from '../utils/AppError.js';

function publicBoard(board) {
  return {
    id: board.id,
    name: board.name,
    taskCount: board.taskIds.length,
  };
}

function publicTask(task) {
  const { ownerId, ...taskData } = task;
  return taskData;
}

export function listBoards(user) {
  return boardRepository.findAllByOwner(user.id).map(publicBoard);
}

export function createBoard(boardInput, user) {
  const board = {
    id: randomUUID(),
    name: boardInput.name,
    ownerId: user.id,
    taskIds: [],
  };

  return publicBoard(boardRepository.create(board));
}

export function listBoardTasks(boardId, user) {
  const board = boardRepository.findByIdForOwner(boardId, user.id);

  if (!board) {
    throw new NotFoundError('Board');
  }

  const tasks = taskRepository
    .findAllByOwner(user.id)
    .filter((task) => board.taskIds.includes(task.id))
    .map(publicTask);

  return tasks;
}
