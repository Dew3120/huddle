import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    legacyId: {
      type: String,
      unique: true,
      sparse: true,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    assignee: {
      type: String,
      required: true,
      trim: true,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    position: {
      type: Number,
      min: 0,
      default: 0,
    },
    version: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_document, value) {
        value.id = value.legacyId ?? value._id.toString();
        value.boardId = value.boardId.toString();

        if (value.columnId) {
          value.columnId = value.columnId.toString();
        }

        if (value.assigneeId) {
          value.assigneeId = value.assigneeId.toString();
        }

        value.dueDate = value.dueDate.toISOString().slice(0, 10);
        delete value._id;
        delete value.legacyId;
        return value;
      },
    },
  },
);

taskSchema.index(
  { boardId: 1, status: 1, position: 1 },
  { name: 'tasks_by_board_status_position' },
);
taskSchema.index(
  { boardId: 1, dueDate: 1 },
  { name: 'tasks_by_board_due_date' },
);
taskSchema.index(
  { assigneeId: 1, status: 1 },
  { name: 'tasks_by_assignee_status' },
);
taskSchema.index(
  { title: 'text', description: 'text' },
  { name: 'tasks_text_search' },
);

export const Task = mongoose.model('Task', taskSchema);
