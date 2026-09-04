import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    legacyId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_document, value) {
        value.id = value._id.toString();
        delete value._id;
        delete value.legacyId;
        delete value.passwordHash;
        return value;
      },
    },
  },
);

export const User = mongoose.model('User', userSchema);
