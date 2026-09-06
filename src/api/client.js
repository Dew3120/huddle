export const TOKEN_STORAGE_KEY = 'token';

const BASE_URL = import.meta.env?.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor({
    message = 'Request failed.',
    status = 0,
    code = 'REQUEST_FAILED',
    details,
    requestId,
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

export function isNetworkError(error) {
  return (
    (typeof navigator !== 'undefined' && navigator.onLine === false) ||
    error instanceof TypeError ||
    error?.status === 0 ||
    [502, 503, 504].includes(error?.status)
  );
}

export function getAuthToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
}

export function setAuthToken(token) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

function getHeaders(options) {
  const headers = new Headers(options.headers ?? {});
  const token = getAuthToken();

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

async function toApiError(response) {
  let body = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  const error = body?.error;

  return new ApiError({
    message:
      error?.message ?? `Request failed with status ${response.status}.`,
    status: response.status,
    code: error?.code,
    details: error?.details,
    requestId: error?.requestId,
  });
}

export async function request(path, options = {}) {
  const hadToken = Boolean(getAuthToken());
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: getHeaders(options),
  });

  if (response.status === 401 && hadToken) {
    clearAuthToken();
    window.dispatchEvent(new Event('auth:expired'));
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
