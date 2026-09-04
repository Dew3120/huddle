import { boards } from '../data/boards.js';

export function findAllByOwner(ownerId) {
  return boards.filter((board) => board.ownerId === ownerId);
}

export function findFirstByOwner(ownerId) {
  return boards.find((board) => board.ownerId === ownerId) ?? null;
}

export function findByIdForOwner(id, ownerId) {
  return boards.find((board) => board.id === id && board.ownerId === ownerId) ?? null;
}

export function create(board) {
  boards.push(board);
  return board;
}
