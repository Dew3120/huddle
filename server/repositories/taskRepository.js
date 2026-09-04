import { tasks } from '../data/tasks.js';

export function findAll() {
  return tasks;
}

export function findAllByOwner(ownerId) {
  return tasks.filter((task) => task.ownerId === ownerId);
}

export function findAllByBoardForOwner(boardId, ownerId) {
  return tasks.filter(
    (task) => task.boardId === boardId && task.ownerId === ownerId,
  );
}

export function countByBoardForOwner(boardId, ownerId) {
  return tasks.filter(
    (task) => task.boardId === boardId && task.ownerId === ownerId,
  ).length;
}

export function findById(id) {
  return tasks.find((task) => task.id === id) ?? null;
}

export function findByIdForOwner(id, ownerId) {
  return tasks.find((task) => task.id === id && task.ownerId === ownerId) ?? null;
}

export function create(task) {
  tasks.push(task);
  return task;
}

export function updateForOwner(id, ownerId, updates) {
  const taskIndex = tasks.findIndex(
    (task) => task.id === id && task.ownerId === ownerId,
  );

  if (taskIndex === -1) {
    return null;
  }

  const updatedTask = {
    ...tasks[taskIndex],
    ...updates,
  };

  tasks[taskIndex] = updatedTask;
  return updatedTask;
}

export function removeForOwner(id, ownerId) {
  const taskIndex = tasks.findIndex(
    (task) => task.id === id && task.ownerId === ownerId,
  );

  if (taskIndex === -1) {
    return false;
  }

  tasks.splice(taskIndex, 1);
  return true;
}
