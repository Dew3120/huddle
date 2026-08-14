const {
  createTask: createTaskRecord,
  deleteTask: deleteTaskRecord,
  findTaskById,
  getTasks: getTaskRecords,
  updateTask: updateTaskRecord,
} = require('../models/Task');

const VALID_TAGS = [
  'Frontend',
  'Backend',
  'Design',
  'DevOps',
  'Testing',
  'Docs',
];

const VALID_COLUMNS = ['todo', 'doing', 'done'];

const validateTask = (data, partial = false) => {
  if ((!partial || data.title !== undefined) &&
      (typeof data.title !== 'string' || !data.title.trim())) {
    return 'Task title is required';
  }

  if ((!partial || data.tag !== undefined) &&
      !VALID_TAGS.includes(data.tag)) {
    return 'Invalid task tag';
  }

  if ((!partial || data.assigneeId !== undefined) &&
      (typeof data.assigneeId !== 'string' || !data.assigneeId.trim())) {
    return 'Assignee is required';
  }

  if ((!partial || data.columnId !== undefined) &&
      !VALID_COLUMNS.includes(data.columnId)) {
    return 'Invalid task column';
  }

  if (data.description !== undefined &&
      typeof data.description !== 'string') {
    return 'Description must be text';
  }

  return null;
};

const getTasks = (req, res) => {
  return res.status(200).json(getTaskRecords());
};

const getTaskById = (req, res) => {
  const task = findTaskById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  return res.status(200).json(task);
};

const createTask = (req, res) => {
  const validationError = validateTask(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const task = createTaskRecord({
    ...req.body,
    createdBy: req.user.id,
  });

  return res.status(201).json(task);
};

const updateTask = (req, res) => {
  const existingTask = findTaskById(req.params.id);

  if (!existingTask) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (
    req.body.version !== undefined &&
    req.body.version !== existingTask.version
  ) {
    return res.status(409).json({
      message: 'Task was updated by another user',
      currentTask: existingTask,
    });
  }

  const validationError = validateTask(req.body, true);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const allowedFields = [
    'title',
    'description',
    'tag',
    'assigneeId',
    'columnId',
  ];

  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const task = updateTaskRecord(
    req.params.id,
    updates,
    req.user.id
  );

  return res.status(200).json(task);
};

const deleteTask = (req, res) => {
  const task = deleteTaskRecord(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  return res.status(200).json({
    message: 'Task deleted',
    task,
  });
};

module.exports = {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
};