import * as boardRepository from '../repositories/boardRepository.js';
import * as taskRepository from '../repositories/taskRepository.js';
import { NotFoundError } from '../utils/AppError.js';
import { queryTaskCollection } from '../utils/taskCollection.js';

function publicBoard(board, taskCount) {
  const value = board.toJSON ? board.toJSON() : board;

  return {
    id: value.id,
    name: value.name,
    taskCount,
  };
}

export async function listBoards(user) {
  const boards = await boardRepository.findAllByOwner(user.databaseId);

  return Promise.all(
    boards.map(async (board) => {
      const boardId = board.toJSON().id;
      const taskCount = await taskRepository.countByBoardForOwner(
        boardId,
        user.id,
      );

      return publicBoard(board, taskCount);
    }),
  );
}

export async function createBoard(boardInput, user) {
  const board = await boardRepository.create({
    name: boardInput.name,
    ownerId: user.databaseId,
    members: [{ userId: user.databaseId, role: 'owner' }],
    columns: [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Done', position: 2 },
    ],
  });

  return publicBoard(board, 0);
}

export async function listBoardTasks(boardId, query, user) {
  const board = await boardRepository.findByIdForOwner(
    boardId,
    user.databaseId,
  );

  if (!board) {
    throw new NotFoundError('Board');
  }

  const tasks = await taskRepository.findAllByBoardForOwner(
    board.toJSON().id,
    user.id,
  );

  return queryTaskCollection(tasks, query);
}
