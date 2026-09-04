import { request } from './client.js';

const TASK_PAGE_SIZE = 100;

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
  const tasks = [];
  let page = 1;

  while (true) {
    const response = await request(
      withQuery('/api/tasks', {
        ...params,
        page,
        limit: TASK_PAGE_SIZE,
      }),
    );

    tasks.push(...response.data);

    if (response.data.length === 0 || tasks.length >= response.meta.total) {
      return tasks;
    }

    page += 1;
  }
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
