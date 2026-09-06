import mongoose from 'mongoose';
import { Board } from '../models/Board.js';

function idFilter(id) {
  if (mongoose.isValidObjectId(id)) {
    return { _id: id };
  }

  return { legacyId: id };
}

export async function findAllByOwner(ownerId) {
  return Board.find({ ownerId }).sort({ createdAt: 1, _id: 1 });
}

export async function findFirstByOwner(ownerId) {
  return Board.findOne({ ownerId }).sort({ createdAt: 1, _id: 1 });
}

export async function findByIdForOwner(id, ownerId) {
  return Board.findOne({
    ...idFilter(id),
    ownerId,
  });
}

export async function create(board) {
  return Board.create(board);
}
