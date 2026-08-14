import type { Task } from '@/app/kanban-board/components/types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'huddle-token';
const USER_KEY = 'huddle-user';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export type TaskInput = Pick<
  Task,
  'title' | 'description' | 'tag' | 'assigneeId' | 'columnId'
>;

export const saveSession = (
  session: AuthResponse,
  remember = false,
) => {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  storage.setItem(TOKEN_KEY, session.token);
  storage.setItem(USER_KEY, JSON.stringify(session.user));

  otherStorage.removeItem(TOKEN_KEY);
  otherStorage.removeItem(USER_KEY);
};

export const getToken = () =>
  localStorage.getItem(TOKEN_KEY) ||
  sessionStorage.getItem(TOKEN_KEY);

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

const request = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data as T;
};

export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const taskApi = {
  getAll: () => request<Task[]>('/tasks'),

  create: (task: TaskInput) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  update: (
    id: string,
    updates: Partial<TaskInput> & { version?: number },
  ) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  remove: (id: string) =>
    request<{ message: string; task: Task }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};