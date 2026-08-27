import { request } from './client.js';

function withQuery(path, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  return query ? `${path}?${query}` : path;
}

export async function getTasks(params = {}) {
  const response = await request(withQuery('/api/tasks', params));

  return response.data;
}

export async function createTask(task) {
  const response = await request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });

  return response.data;
}

export async function updateTask(id, changes) {
  const response = await request(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });

  return response.data;
}

export async function deleteTask(id) {
  await request(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
}
