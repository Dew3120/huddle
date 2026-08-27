import { request } from './client.js';

export async function registerUser(credentials) {
  const response = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  return response.data;
}

export async function loginUser(credentials) {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  return response.data;
}

export async function getCurrentUser() {
  const response = await request('/api/auth/me');

  return response.data;
}
