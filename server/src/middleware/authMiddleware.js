const jwt = require('jsonwebtoken');

const { findUserById } = require('../models/User');

const protect = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication token required',
    });
  }

  const token = authorization.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = findUserById(payload.userId);

    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists',
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return next();
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired authentication token',
    });
  }
};

module.exports = {
  protect,
};