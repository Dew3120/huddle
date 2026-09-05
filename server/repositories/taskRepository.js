import mongoose from 'mongoose';
import { Board } from '../models/Board.js';
import { Task } from '../models/Task.js';

const sortFields = ['title', 'assignee', 'status', 'dueDate'];

function idFilter(id) {
  if (mongoose.isValidObjectId(id)) {
    return { _id: id };
  }

  return { legacyId: id };
}

function boardIdFilter(id) {
  if (mongoose.isValidObjectId(id)) {
    return { _id: id };
  }

  return { legacyId: id };
}

function collectionFilter({ status, assignee } = {}) {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (assignee) {
    filter.assignee = new RegExp(
      `^${assignee.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
      'i',
    );
  }

  return filter;
}

function collectionSort(sort = 'dueDate') {
  const descending = sort.startsWith('-');
  const requestedField = descending ? sort.slice(1) : sort;
  const field = sortFields.includes(requestedField) ? requestedField : 'dueDate';

  return {
    [field]: descending ? -1 : 1,
    _id: 1,
  };
}

async function findOwnedBoardIds(ownerId) {
  return Board.find({ ownerId }).distinct('_id');
}

async function findOwnedBoard(boardId, ownerId) {
  return Board.findOne({
    ...boardIdFilter(boardId),
    ownerId,
  });
}

async function findPage(filter, query = {}) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const completeFilter = {
    ...filter,
    ...collectionFilter(query),
  };

  const [tasks, total] = await Promise.all([
    Task.find(completeFilter)
      .sort(collectionSort(query.sort))
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(completeFilter),
  ]);

  return { tasks, total };
}

export async function findAll() {
  return Task.find().sort({ createdAt: 1, _id: 1 });
}

export async function findAllByOwner(ownerId) {
  const boardIds = await findOwnedBoardIds(ownerId);
  return Task.find({ boardId: { $in: boardIds } });
}

export async function findPageByOwner(ownerId, query) {
  const boardIds = await findOwnedBoardIds(ownerId);
  return findPage({ boardId: { $in: boardIds } }, query);
}

export async function findAllByBoardForOwner(boardId, ownerId) {
  const board = await findOwnedBoard(boardId, ownerId);

  if (!board) {
    return [];
  }

  return Task.find({ boardId: board._id });
}

export async function findPageByBoard(boardId, query) {
  return findPage({ boardId }, query);
}

export async function countByBoardForOwner(boardId, ownerId) {
  const board = await findOwnedBoard(boardId, ownerId);

  if (!board) {
    return 0;
  }

  return Task.countDocuments({ boardId: board._id });
}

export async function findById(id) {
  return Task.findOne(idFilter(id));
}

export async function findByIdForOwner(id, ownerId) {
  const boardIds = await findOwnedBoardIds(ownerId);

  return Task.findOne({
    ...idFilter(id),
    boardId: { $in: boardIds },
  });
}

export async function create(task) {
  return Task.create(task);
}

export async function updateForOwner(id, ownerId, updates) {
  const boardIds = await findOwnedBoardIds(ownerId);
  const filter = {
    ...idFilter(id),
    boardId: { $in: boardIds },
  };

  if (updates.version !== undefined) {
    filter.version = updates.version;
  }

  const { version, ...taskUpdates } = updates;

  return Task.findOneAndUpdate(
    filter,
    {
      $set: taskUpdates,
      $inc: { version: 1 },
    },
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
}

export async function removeForOwner(id, ownerId) {
  const boardIds = await findOwnedBoardIds(ownerId);
  const task = await Task.findOneAndDelete({
    ...idFilter(id),
    boardId: { $in: boardIds },
  });

  return Boolean(task);
}
