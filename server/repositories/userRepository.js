import { randomUUID } from 'node:crypto';

const users = [
  {
    id: 'user-001',
    email: 'user1@nsbm.lk',
    passwordHash: '$2b$10$ln1jyKAg/gV3YMCugLhvoOCqhd6rJqPNcH2fhqwnp..ciKm9I3bFq',
  },
  {
    id: 'user-002',
    email: 'user2@nsbm.lk',
    passwordHash: '$2b$10$ln1jyKAg/gV3YMCugLhvoOCqhd6rJqPNcH2fhqwnp..ciKm9I3bFq',
  },
];

export async function findByEmail(email) {
  return users.find((user) => user.email === email.toLowerCase()) ?? null;
}

export async function findById(id) {
  return users.find((user) => user.id === id) ?? null;
}

export async function create({ email, passwordHash }) {
  const user = {
    id: randomUUID(),
    email: email.toLowerCase(),
    passwordHash,
  };

  users.push(user);
  return user;
}

export function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
  };
}
