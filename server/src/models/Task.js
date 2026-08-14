const { randomUUID } = require('crypto');

const tasks = [];

const getTasks = () => tasks;

const findTaskById = (id) =>
  tasks.find((task) => task.id === id);

const createTask = ({
  title,
  description,
  tag,
  assigneeId,
  columnId,
  createdBy,
}) => {
  const now = new Date();

  const task = {
    id: randomUUID(),
    title: title.trim(),
    description: description?.trim() || '',
    tag,
    assigneeId,
    columnId,
    createdAt: now.toISOString().slice(0, 10),
    updatedAt: now.toISOString(),
    createdBy,
    version: 1,
  };

  tasks.push(task);
  return task;
};

const updateTask = (id, updates, updatedBy) => {
  const task = findTaskById(id);

  if (!task) {
    return null;
  }

  Object.assign(task, updates, {
    updatedAt: new Date().toISOString(),
    updatedBy,
    version: task.version + 1,
  });

  return task;
};

const deleteTask = (id) => {
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return null;
  }

  const [deletedTask] = tasks.splice(index, 1);
  return deletedTask;
};

module.exports = {
  createTask,
  deleteTask,
  findTaskById,
  getTasks,
  updateTask,
};