import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      required: true,
    },
  },
  { _id: false },
);

const columnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: Number,
    required: true,
    min: 0,
  },
});

const boardSchema = new mongoose.Schema(
  {
    legacyId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: {
      type: [memberSchema],
      default: [],
    },
    columns: {
      type: [columnSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_document, value) {
        value.id = value.legacyId ?? value._id.toString();
        delete value._id;
        delete value.legacyId;
        return value;
      },
    },
  },
);

export const Board = mongoose.model('Board', boardSchema);
