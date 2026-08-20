import { mockTasks } from '../data/mockTasks.js';

export function getTasks() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTasks.map((task) => ({ ...task })));
    }, 400);
  });
}