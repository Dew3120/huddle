import { tasks } from '../data/tasks.js';

export function findAll() {
  return tasks;
}

export function findById(id) {
  return tasks.find((task) => task.id === id) ?? null;
}

export function create(task) {
  tasks.push(task);
  return task;
}

export function update(id, updates) {
  const taskIndex = tasks.findIndex((task) => task.id === id);

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

export function remove(id) {
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return false;
  }

  tasks.splice(taskIndex, 1);
  return true;
}
