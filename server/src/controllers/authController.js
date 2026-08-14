const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  createUser,
  findUserByEmail,
} = require('../models/User');

const createToken = (userId) =>
  jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        message: 'Name, email, and password are required',
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        message: 'Enter a valid email address',
      });
    }

    if (password.length < 8 || !/[A-Z]/.test(password)) {
      return res.status(400).json({
        message: 'Password must contain at least 8 characters and one uppercase letter',
      });
    }

    if (findUserByEmail(email)) {
      return res.status(409).json({
        message: 'An account with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = createUser({ name, email, passwordHash });

    return res.status(201).json({
      token: createToken(user.id),
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Registration failed:', error.message);
    return res.status(500).json({
      message: 'Unable to register user',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const user = findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    return res.status(200).json({
      token: createToken(user.id),
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({
      message: 'Unable to log in',
    });
  }
};

module.exports = {
  login,
  register,
};