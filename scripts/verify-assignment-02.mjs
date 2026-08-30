const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000";
const SEEDED_CREDENTIALS = {
  email: "user1@nsbm.lk",
  password: "password123",
};

const passedChecks = [];
let authToken = "";
let createdTaskId = "";

function formatBody(body) {
  if (body === null) return "<empty>";
  return typeof body === "string" ? body : JSON.stringify(body);
}

function check(label, condition, result) {
  if (!condition) {
    throw new Error(
      `${label}: received HTTP ${result.response.status} with ${formatBody(result.body)}`,
    );
  }

  passedChecks.push(label);
  console.log(
    `PASS ${String(passedChecks.length).padStart(2, "0")} - ${label}`,
  );
}

async function request(path, options = {}) {
  const { method = "GET", body, token, headers = {} } = options;
  const requestHeaders = { ...headers };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
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

function futureDate(daysFromToday = 7) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

async function cleanUpCreatedTask() {
  if (!createdTaskId || !authToken) return;

  try {
    await request(`/api/tasks/${createdTaskId}`, {
      method: "DELETE",
      token: authToken,
    });
  } catch (error) {
    console.warn(`Cleanup warning: ${error.message}`);
  }
}

async function run() {
  console.log(`\nChecking Huddle Assignment 02 API at ${BASE_URL}\n`);

  const health = await request("/api/health");
  check(
    "Health endpoint returns 200 and status ok",
    health.response.status === 200 && health.body?.data?.status === "ok",
    health,
  );

  const verificationEmail = `rovin.verify.${Date.now()}@huddle.test`;
  const registrationBody = {
    email: verificationEmail,
    password: "Verification123!",
  };

  const registration = await request("/api/auth/register", {
    method: "POST",
    body: registrationBody,
  });
  check(
    "Registration returns 201 without exposing a password hash",
    registration.response.status === 201 &&
      registration.body?.data?.email === verificationEmail &&
      !("passwordHash" in (registration.body?.data ?? {})),
    registration,
  );

  const duplicateRegistration = await request("/api/auth/register", {
    method: "POST",
    body: registrationBody,
  });
  check(
    "Duplicate registration returns 409 EMAIL_EXISTS",
    duplicateRegistration.response.status === 409 &&
      duplicateRegistration.body?.error?.code === "EMAIL_EXISTS",
    duplicateRegistration,
  );

  const login = await request("/api/auth/login", {
    method: "POST",
    body: SEEDED_CREDENTIALS,
  });
  check(
    "Login returns 200 with a signed token",
    login.response.status === 200 &&
      typeof login.body?.data?.token === "string" &&
      login.body.data.token.length > 20,
    login,
  );
  authToken = login.body.data.token;

  const currentUser = await request("/api/auth/me", { token: authToken });
  check(
    "Authenticated /me returns the current public user",
    currentUser.response.status === 200 &&
      currentUser.body?.data?.email === SEEDED_CREDENTIALS.email &&
      !("passwordHash" in (currentUser.body?.data ?? {})),
    currentUser,
  );

  const noToken = await request("/api/tasks");
  check(
    "Protected task route rejects a missing token with 401 NO_TOKEN",
    noToken.response.status === 401 && noToken.body?.error?.code === "NO_TOKEN",
    noToken,
  );

  const badToken = await request("/api/tasks", { token: "not-a-real-token" });
  check(
    "Protected task route rejects an invalid token with 401 BAD_TOKEN",
    badToken.response.status === 401 &&
      badToken.body?.error?.code === "BAD_TOKEN",
    badToken,
  );

  const filteredTasks = await request(
    "/api/tasks?status=done&assignee=Alex&sort=-dueDate&page=1&limit=2",
    { token: authToken },
  );
  check(
    "Task collection supports filtering, sorting, and pagination",
    filteredTasks.response.status === 200 &&
      Array.isArray(filteredTasks.body?.data) &&
      filteredTasks.body.data.length > 0 &&
      filteredTasks.body.data.every(
        (task) => task.status === "done" && task.assignee === "Alex",
      ) &&
      filteredTasks.body?.meta?.page === 1 &&
      filteredTasks.body?.meta?.limit === 2,
    filteredTasks,
  );

  const boards = await request("/api/boards", { token: authToken });
  check(
    "Board collection returns the authenticated user boards",
    boards.response.status === 200 &&
      Array.isArray(boards.body?.data) &&
      boards.body.data.some((board) => board.id === "board-001"),
    boards,
  );

  const boardTasks = await request(
    "/api/boards/board-001/tasks?status=done&assignee=Alex&sort=-dueDate&page=1&limit=2",
    { token: authToken },
  );
  check(
    "Board task collection applies the shared task query contract",
    boardTasks.response.status === 200 &&
      Array.isArray(boardTasks.body?.data) &&
      boardTasks.body.data.length > 0 &&
      boardTasks.body.data.every(
        (task) => task.status === "done" && task.assignee === "Alex",
      ) &&
      boardTasks.body?.meta?.limit === 2,
    boardTasks,
  );

  const inaccessibleBoard = await request("/api/boards/board-002/tasks", {
    token: authToken,
  });
  check(
    "Ownership prevents access to another user board",
    inaccessibleBoard.response.status === 404 &&
      inaccessibleBoard.body?.error?.code === "BOARD_NOT_FOUND",
    inaccessibleBoard,
  );

  const invalidTask = await request("/api/tasks", {
    method: "POST",
    token: authToken,
    body: {
      title: "ab",
      assignee: "Rovin",
      status: "todo",
      dueDate: futureDate(),
    },
  });
  check(
    "Invalid task returns 400 VALIDATION_ERROR with field details",
    invalidTask.response.status === 400 &&
      invalidTask.body?.error?.code === "VALIDATION_ERROR" &&
      Array.isArray(invalidTask.body?.error?.details) &&
      invalidTask.body.error.details.some((detail) => detail.field === "title"),
    invalidTask,
  );

  const createTask = await request("/api/tasks", {
    method: "POST",
    token: authToken,
    body: {
      title: "Verify Assignment 02 API",
      assignee: "Rovin",
      status: "todo",
      dueDate: futureDate(),
    },
  });
  check(
    "Valid task creation returns 201 and a generated id",
    createTask.response.status === 201 &&
      typeof createTask.body?.data?.id === "string" &&
      createTask.body.data.title === "Verify Assignment 02 API",
    createTask,
  );
  createdTaskId = createTask.body.data.id;

  const taskDetail = await request(`/api/tasks/${createdTaskId}`, {
    token: authToken,
  });
  check(
    "Created task can be read by id",
    taskDetail.response.status === 200 &&
      taskDetail.body?.data?.id === createdTaskId,
    taskDetail,
  );

  const updateTask = await request(`/api/tasks/${createdTaskId}`, {
    method: "PATCH",
    token: authToken,
    body: { status: "done" },
  });
  check(
    "Task update returns 200 with the new status",
    updateTask.response.status === 200 &&
      updateTask.body?.data?.id === createdTaskId &&
      updateTask.body.data.status === "done",
    updateTask,
  );

  const missingTask = await request("/api/tasks/not-real", {
    token: authToken,
  });
  check(
    "Missing task returns 404 TASK_NOT_FOUND",
    missingTask.response.status === 404 &&
      missingTask.body?.error?.code === "TASK_NOT_FOUND",
    missingTask,
  );

  const deleteTask = await request(`/api/tasks/${createdTaskId}`, {
    method: "DELETE",
    token: authToken,
  });
  check(
    "Task deletion returns 204 with no response body",
    deleteTask.response.status === 204 && deleteTask.body === null,
    deleteTask,
  );
  createdTaskId = "";

  console.log(`\nSUCCESS: ${passedChecks.length}/17 checks passed.\n`);
}

try {
  await run();
} catch (error) {
  console.error(`\nFAIL: ${error.message}\n`);
  process.exitCode = 1;
} finally {
  await cleanUpCreatedTask();
}