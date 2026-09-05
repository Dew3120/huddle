import * as boardRepository from '../repositories/boardRepository.js';
import * as taskRepository from '../repositories/taskRepository.js';
import { NotFoundError, ConflictError } from '../utils/AppError.js';
import { publicTask } from '../utils/taskCollection.js';

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

export async function listTasks(query = {}, user) {
  const result = await taskRepository.findPageByOwner(user.databaseId, query);

  return {
    data: result.tasks.map(publicTask),
    meta: {
      page: query.page,
      limit: query.limit,
      total: result.total,
    },
  };
}

export async function getTaskById(id, user) {
  const task = await taskRepository.findByIdForOwner(id, user.databaseId);

  if (!task) {
    throw new NotFoundError('Task');
  }

  return publicTask(task);
}

export async function createTask(taskInput, user) {
  const board = await findOrCreateDefaultBoard(user);
  const task = {
    ...taskInput,
    boardId: board._id,
  };

  return publicTask(await taskRepository.create(task));
}

export async function updateTask(id, updates, user) {
  const task = await taskRepository.updateForOwner(
    id,
    user.databaseId,
    updates,
  );

  if (task) {
    return publicTask(task);
  }

  const current = await taskRepository.findByIdForOwner(
    id,
    user.databaseId,
  );

  if (!current) {
    throw new NotFoundError('Task');
  }

  if (updates.version !== undefined) {
    throw new ConflictError(
      'Task was updated by someone else',
      'TASK_CONFLICT',
      {
        current: publicTask(current),
        yourVersion: updates.version,
      },
    );
  }

  throw new NotFoundError('Task');
}

export async function deleteTask(id, user) {
  const wasDeleted = await taskRepository.removeForOwner(
    id,
    user.databaseId,
  );

  if (!wasDeleted) {
    throw new NotFoundError('Task');
  }
}
