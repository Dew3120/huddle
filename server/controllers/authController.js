import * as authService from '../services/authService.js';

export async function register(req, res) {
  const user = await authService.register(req.body);

  res.status(201).json({
    data: user,
  });
}

export async function login(req, res) {
  const result = await authService.login(req.body);

  res.json({
    data: result,
  });
}

export function me(req, res) {
  res.json({
    data: req.user,
  });
}
