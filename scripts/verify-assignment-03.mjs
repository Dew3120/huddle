const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4000';
const credentials = {
  email: 'user1@nsbm.lk',
  password: 'password123',
};

const passedChecks = [];
let token = '';
let createdTaskId = '';

function formatBody(body) {
  if (body === null) return '<empty>';
  return typeof body === 'string' ? body : JSON.stringify(body);
}

function check(label, condition, result) {
  if (!condition) {
    throw new Error(
      `${label}: received HTTP ${result.response.status} with ${formatBody(result.body)}`,
    );
  }

  passedChecks.push(label);
  console.log(
    `PASS ${String(passedChecks.length).padStart(2, '0')} - ${label}`,
  );
}

async function request(path, options = {}) {
  const { method = 'GET', body, authToken = token } = options;
  const headers = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let responseBody = null;

  if (text) {
    try {
      responseBody = JSON.parse(text);
    } catch {
      responseBody = text;
    }
  }

  return { response, body: responseBody };
}

function futureDate(daysFromToday = 14) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

async function cleanUp() {
  if (!createdTaskId || !token) return;

  try {
    await request(`/api/tasks/${createdTaskId}`, { method: 'DELETE' });
  } catch (error) {
    console.warn(`Cleanup warning: ${error.message}`);
  }
}

async function run() {
  console.log(`\nChecking Huddle Assignment 03 at ${BASE_URL}\n`);

  const health = await request('/api/health', { authToken: '' });
  check(
    'Health reports a connected MongoDB database',
    health.response.status === 200 &&
      health.body?.data?.status === 'ok' &&
      health.body?.data?.database?.status === 'connected' &&
      health.body?.data?.database?.readyState === 1,
    health,
  );

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: credentials,
    authToken: '',
  });
  check(
    'Seeded user can sign in',
    login.response.status === 200 && Boolean(login.body?.data?.token),
    login,
  );
  token = login.body.data.token;

  const boards = await request('/api/boards');
  check(
    'MongoDB returns at least one owned board',
    boards.response.status === 200 &&
      Array.isArray(boards.body?.data) &&
      boards.body.data.length > 0,
    boards,
  );

  const created = await request('/api/tasks', {
    method: 'POST',
    body: {
      title: 'Charles Assignment 03 Verification',
      assignee: 'Charles',
      status: 'todo',
      dueDate: futureDate(),
    },
  });
  check(
    'Task creation returns a MongoDB task at version 0',
    created.response.status === 201 &&
      Boolean(created.body?.data?.id) &&
      created.body?.data?.version === 0,
    created,
  );

  createdTaskId = created.body.data.id;
  const boardId = created.body.data.boardId;

  const updated = await request(`/api/tasks/${createdTaskId}`, {
    method: 'PATCH',
    body: {
      title: 'Charles Verified Version Update',
      version: 0,
    },
  });
  check(
    'Current version update succeeds and increments the version',
    updated.response.status === 200 &&
      updated.body?.data?.title === 'Charles Verified Version Update' &&
      updated.body?.data?.version === 1,
    updated,
  );

  const staleUpdate = await request(`/api/tasks/${createdTaskId}`, {
    method: 'PATCH',
    body: {
      title: 'This Stale Update Must Not Win',
      version: 0,
    },
  });
  check(
    'Stale update returns 409 TASK_CONFLICT',
    staleUpdate.response.status === 409 &&
      staleUpdate.body?.error?.code === 'TASK_CONFLICT' &&
      staleUpdate.body?.error?.details?.yourVersion === 0 &&
      staleUpdate.body?.error?.details?.current?.version === 1,
    staleUpdate,
  );

  const taskAfterConflict = await request(`/api/tasks/${createdTaskId}`);
  check(
    'Rejected stale update does not overwrite the winning task',
    taskAfterConflict.response.status === 200 &&
      taskAfterConflict.body?.data?.title === 'Charles Verified Version Update' &&
      taskAfterConflict.body?.data?.version === 1,
    taskAfterConflict,
  );

  const statistics = await request(`/api/boards/${boardId}/task-stats`);
  check(
    'Board statistics aggregation returns both result groups',
    statistics.response.status === 200 &&
      Array.isArray(statistics.body?.data?.byStatus) &&
      Array.isArray(statistics.body?.data?.overdueByAssignee),
    statistics,
  );

  const deleted = await request(`/api/tasks/${createdTaskId}`, {
    method: 'DELETE',
  });
  check(
    'Verification task is deleted cleanly',
    deleted.response.status === 204 && deleted.body === null,
    deleted,
  );
  createdTaskId = '';

  console.log(`\nSUCCESS: ${passedChecks.length}/9 checks passed.\n`);
}

try {
  await run();
} catch (error) {
  console.error(`\nFAIL: ${error.message}\n`);
  process.exitCode = 1;
} finally {
  await cleanUp();
}