import { randomUUID } from 'node:crypto';
import * as boardRepository from '../repositories/boardRepository.js';
import * as taskRepository from '../repositories/taskRepository.js';
import { NotFoundError } from '../utils/AppError.js';
import { queryTaskCollection } from '../utils/taskCollection.js';

function publicBoard(board, taskCount) {
  return {
    id: board.id,
    name: board.name,
    taskCount,
  };
}

export function listBoards(user) {
  return boardRepository.findAllByOwner(user.id).map((board) =>
    publicBoard(
      board,
      taskRepository.countByBoardForOwner(board.id, user.id),
    ),
  );
}

export function createBoard(boardInput, user) {
  const board = {
    id: randomUUID(),
    name: boardInput.name,
    ownerId: user.id,
  };

  return publicBoard(boardRepository.create(board), 0);
}

export function listBoardTasks(boardId, query, user) {
  const board = boardRepository.findByIdForOwner(boardId, user.id);

  if (!board) {
    throw new NotFoundError('Board');
  }

  const tasks = taskRepository.findAllByBoardForOwner(
    board.id,
    user.id,
  );

  return queryTaskCollection(tasks, query);
}
