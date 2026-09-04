import mongoose from 'mongoose';
import { boards as boardSeeds } from '../data/boards.js';
import { tasks as taskSeeds } from '../data/tasks.js';
import { Board } from '../models/Board.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { connectDb } from './connect.js';

const passwordHash =
  '$2b$10$ln1jyKAg/gV3YMCugLhvoOCqhd6rJqPNcH2fhqwnp..ciKm9I3bFq';

const userSeeds = [
  {
    legacyId: 'user-001',
    email: 'user1@nsbm.lk',
    name: 'Huddle Demo User',
  },
  {
    legacyId: 'user-002',
    email: 'user2@nsbm.lk',
    name: 'Restricted Demo User',
  },
];

const columnSeeds = [
  { title: 'To Do', position: 0 },
  { title: 'In Progress', position: 1 },
  { title: 'Done', position: 2 },
];

function columnTitleForStatus(status) {
  if (status === 'in-progress') {
    return 'In Progress';
  }

  if (status === 'done') {
    return 'Done';
  }

  return 'To Do';
}

async function seedUsers() {
  const users = new Map();

  for (const seed of userSeeds) {
    const user = await User.findOneAndUpdate(
      { email: seed.email },
      {
        $set: {
          legacyId: seed.legacyId,
          email: seed.email,
          name: seed.name,
          passwordHash,
        },
      },
      { returnDocument: 'after', runValidators: true, upsert: true },
    );

    users.set(seed.legacyId, user);
  }

  return users;
}

async function seedBoards(users) {
  const boards = new Map();

  for (const seed of boardSeeds) {
    const owner = users.get(seed.ownerId);
    let board = await Board.findOne({ legacyId: seed.id });

    if (!board) {
      board = await Board.findOne({ name: seed.name, ownerId: owner._id });
    }

    if (!board) {
      board = new Board();
    }

    board.legacyId = seed.id;
    board.name = seed.name;
    board.ownerId = owner._id;
    board.members = [{ userId: owner._id, role: 'owner' }];

    if (board.columns.length === 0) {
      board.columns = columnSeeds;
    }

    await board.save();
    boards.set(seed.id, board);
  }

  return boards;
}

async function seedTasks(boards) {
  for (const [position, seed] of taskSeeds.entries()) {
    const board = boards.get(seed.boardId);
    const columnTitle = columnTitleForStatus(seed.status);
    const column = board.columns.find((item) => item.title === columnTitle);

    await Task.findOneAndUpdate(
      { legacyId: seed.id },
      {
        $set: {
          legacyId: seed.id,
          boardId: board._id,
          columnId: column?._id,
          title: seed.title,
          assignee: seed.assignee,
          status: seed.status,
          dueDate: new Date(`${seed.dueDate}T00:00:00.000Z`),
          position,
        },
      },
      { returnDocument: 'after', runValidators: true, upsert: true },
    );
  }
}

try {
  await connectDb();
  const users = await seedUsers();
  const boards = await seedBoards(users);
  await seedTasks(boards);
  console.log('Huddle demo data ready');
} catch (error) {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
