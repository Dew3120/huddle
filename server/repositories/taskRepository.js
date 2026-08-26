import { tasks } from '../data/tasks.js';

export function findAll() {
  return tasks;
}

export function findById(id) {
  return tasks.find((task) => task.id === id) ?? null;
}
