const { randomUUID } = require('crypto');

const users = [];

const findUserByEmail = (email) =>
  users.find((user) => user.email === email.toLowerCase());

const findUserById = (id) => users.find((user) => user.id === id);

const createUser = ({ name, email, passwordHash }) => {
  const user = {
    id: randomUUID(),
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  return user;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};