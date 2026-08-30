# Rovin's Assignment 02 API Verification Guide

This guide assumes no prior knowledge. Follow each step in order and do not skip a command.

## Your Assignment

You will add a repeatable verification runner for Huddle's Assignment 02 API. The runner will start from the existing API contract and verify authentication, protected routes, task CRUD, filtering, validation, boards, and ownership behavior.

Your work will add exactly these three files or changes:

1. `scripts/verify-assignment-02.mjs` - the automated API verification runner.
2. `docs/assignment-02-verification.md` - a written record of what the runner checks.
3. `package.json` - one new command named `verify:assignment-02`.

This is real project work and will appear under your name in the Git history.

## Important Rules

- Work only on the branch `feature/session-02-verification`.
- Use your own GitHub-linked name and email before committing.
- Do not edit anything inside `server/` or `src/`.
- Do not edit `README.md`.
- Do not edit Vinuka's files inside `docs/api-evidence/`.
- Do not create or edit the Assignment 02 report.
- Do not install any new npm package. Node.js already provides everything this runner needs.
- Do not commit `.env`, `node_modules/`, or `dist/`.
- Do not change an expected status code just to make a failing check pass.
- If `git status --short` shows work you did not create, stop and ask Dew before continuing.

## Step 1: Check the Required Programs

Open **PowerShell** from the Windows Start menu. Run these commands one at a time:

```powershell
node --version
npm --version
git --version
code --version
```

Expected:

- Node.js should be version 20 or newer.
- npm, Git, and Visual Studio Code should print version numbers.

If `node` or `npm` is not recognized:

1. Open <https://nodejs.org/>.
2. Download the current **LTS** version.
3. Install it using the default options.
4. Close PowerShell, open it again, and repeat the checks.

If `git` is not recognized:

1. Open <https://git-scm.com/download/win>.
2. Install Git for Windows using the default options.
3. Close PowerShell, open it again, and repeat the checks.

If `code` is not recognized but Visual Studio Code is installed, open the project from Visual Studio Code using **File > Open Folder** whenever this guide says to run `code`. You can also reinstall Visual Studio Code from <https://code.visualstudio.com/> and enable the option that adds `code` to PATH.

## Step 2: Open or Download Huddle

The existing repository should be here:

```powershell
cd C:\Users\VICTUS\Desktop\huddle
```

Confirm that it is the correct project:

```powershell
git remote -v
```

The output should include:

```text
https://github.com/Dew3120/huddle.git
```

If `C:\Users\VICTUS\Desktop\huddle` does not exist, download it with:

```powershell
cd C:\Users\VICTUS\Desktop
git clone https://github.com/Dew3120/huddle.git
cd huddle
```

## Step 3: Set Your Git Identity

Use your real name and the email attached to your GitHub account. Replace the email placeholder below before running the command:

```powershell
git config user.name "R S Boklagama"
git config user.email "YOUR-GITHUB-EMAIL-HERE"
git config --get user.name
git config --get user.email
```

Do not continue until the final two commands show your own name and GitHub email. This is what makes the commit count as your contribution.

## Step 4: Check That Your Working Folder Is Clean

Run:

```powershell
git status --short
```

Correct result: no output at all.

If files are listed, do not delete, reset, commit, or stash them. Send the output to Dew and wait for instructions.

## Step 5: Create Your Feature Branch

Run each command separately:

```powershell
git fetch origin
git checkout feature/session-02-backend-foundation
git pull --ff-only origin feature/session-02-backend-foundation
git checkout -b feature/session-02-verification
git branch --show-current
```

The final output must be:

```text
feature/session-02-verification
```

If Git says the branch already exists, use:

```powershell
git checkout feature/session-02-verification
git merge origin/feature/session-02-backend-foundation
git branch --show-current
```

Do not perform the work directly on `main` or `feature/session-02-backend-foundation`.

## Step 6: Install the Existing Dependencies

Run:

```powershell
npm install
```

This may take a few minutes. Warnings are usually acceptable, but the command must finish without an `npm ERR!` failure.

Do not run `npm install` with any package name after it. This task requires no new package.

## Step 7: Create the Local Environment File

Run:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
Get-Content .env
```

The local `.env` file should contain these three settings:

```dotenv
PORT=4000
JWT_SECRET=change-this-development-secret
CLIENT_ORIGIN=http://localhost:5173
```

The `.env` file is for local use only. It is ignored by Git and must never be committed.

## Step 8: Create the Verification Script

Create the folder and open the new file:

```powershell
New-Item -ItemType Directory -Path scripts -Force
code scripts\verify-assignment-02.mjs
```

Paste the complete code below into `scripts/verify-assignment-02.mjs`, then save the file with `Ctrl+S`.

```javascript
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
```

## Step 9: Add the npm Command

Run this exact command from the Huddle folder:

```powershell
npm pkg set "scripts.verify:assignment-02=node scripts/verify-assignment-02.mjs"
```

Check the result:

```powershell
npm pkg get scripts
```

The output should include:

```text
"verify:assignment-02": "node scripts/verify-assignment-02.mjs"
```

Do not manually remove or rename any existing script in `package.json`.

## Step 10: Start the Backend

Keep the current PowerShell window open. Open a **second PowerShell window** and run:

```powershell
cd C:\Users\VICTUS\Desktop\huddle
npm run start:server
```

Expected message:

```text
Huddle API listening at http://localhost:4000
```

Leave this second window running. Do not press `Ctrl+C` yet.

## Step 11: Run Your Verification

Return to the first PowerShell window and run:

```powershell
npm run verify:assignment-02
```

The command should print 17 lines beginning with `PASS` and finish with:

```text
SUCCESS: 17/17 checks passed.
```

Take one screenshot showing the final `PASS` lines and the `SUCCESS: 17/17 checks passed.` line. This screenshot is only for sending to Dew during review; do not add it to `docs/api-evidence/` because that folder belongs to Vinuka's Postman work.

If the runner prints `FAIL`, go to the troubleshooting section at the end of this guide. Do not change the script's expected response codes to hide the failure.

## Step 12: Write the Verification Record

Open a new file:

```powershell
code docs\assignment-02-verification.md
```

Paste the template below. Replace the date and Node version placeholders with the real values from your computer. Only write `PASS (17/17)` after the runner actually passes.

````markdown
# Assignment 02 API Verification

## Owner

R S Boklagama (Rovin)

## Purpose

This verification runner provides a repeatable smoke test for Huddle's Assignment 02 in-memory REST API. It uses Node.js built-in `fetch`, so it adds no test dependency and can be run by any team member before the Assignment 02 tag is created.

## Run It

Start the API in the first terminal:

```powershell
npm run start:server
```

Run the verification in a second terminal:

```powershell
npm run verify:assignment-02
```

The optional `API_BASE_URL` environment variable can target a different API host:

```powershell
$env:API_BASE_URL="http://localhost:4000"
npm run verify:assignment-02
```

## Coverage

|   # | Area             | Expected behavior                                                  |
| --: | ---------------- | ------------------------------------------------------------------ |
|   1 | Health           | `GET /api/health` returns `200` and `status: ok`                   |
|   2 | Registration     | A new user receives `201`; no password hash is returned            |
|   3 | Duplicate email  | Reusing an email returns `409 EMAIL_EXISTS`                        |
|   4 | Login            | Valid credentials return `200` and a JWT                           |
|   5 | Current user     | `GET /api/auth/me` returns the authenticated public user           |
|   6 | Missing token    | A protected task route returns `401 NO_TOKEN`                      |
|   7 | Invalid token    | A protected task route returns `401 BAD_TOKEN`                     |
|   8 | Task query       | Status, assignee, sort, page, and limit are applied                |
|   9 | Board list       | The authenticated user's board is returned                         |
|  10 | Board task query | Board tasks use the shared filter and pagination contract          |
|  11 | Ownership        | Another user's board is not exposed                                |
|  12 | Validation       | An invalid title returns `400 VALIDATION_ERROR` with field details |
|  13 | Create task      | A valid task returns `201` with a generated id                     |
|  14 | Read task        | The created task can be read by id                                 |
|  15 | Update task      | A status patch returns `200` with the updated task                 |
|  16 | Missing task     | An unknown id returns `404 TASK_NOT_FOUND`                         |
|  17 | Delete task      | Deletion returns `204` with no response body                       |

## Latest Local Result

- Date: REPLACE-WITH-TODAYS-DATE
- Environment: Windows, Node REPLACE-WITH-NODE-VERSION
- Result: PASS (17/17)

## Notes

- The API uses in-memory repositories for Assignment 02, so registered users reset when the server restarts.
- The runner creates a unique temporary user each time.
- The runner deletes the task it creates. It also attempts cleanup if a later check fails.
- This smoke runner complements the committed Postman collection; it does not replace the visual API evidence.
````

Save the file with `Ctrl+S`.

## Step 13: Stop the Backend and Run the Frontend Build

In the PowerShell window running the server, press:

```text
Ctrl+C
```

If PowerShell asks whether to terminate the batch job, answer `Y` and press Enter.

Return to the first PowerShell window and run:

```powershell
npm run build
```

The build must finish successfully. The generated `dist/` folder is ignored by Git and must not be committed.

## Step 14: Review Exactly What Changed

Run:

```powershell
git status --short
git diff -- package.json scripts/verify-assignment-02.mjs docs/assignment-02-verification.md
```

The status should show only these three project changes:

```text
 M package.json
?? docs/assignment-02-verification.md
?? scripts/verify-assignment-02.mjs
```

`package-lock.json` should not change because no package was installed specifically for this task. If any file in `server/`, `src/`, `docs/api-evidence/`, `README.md`, or `package-lock.json` is listed, do not commit yet. Send the full `git status --short` output to Dew.

## Step 15: Commit Your Work

Run these commands exactly:

```powershell
git add package.json scripts/verify-assignment-02.mjs docs/assignment-02-verification.md
git status --short
git commit -m "Add Assignment 02 API verification runner"
git status --short
```

After the commit, the final `git status --short` should print nothing.

Confirm that the commit is yours:

```powershell
git log -1 --format="Commit: %h%nAuthor: %an <%ae>%nMessage: %s"
```

The author must show your own name and GitHub-linked email.

## Step 16: Push Your Branch

Run:

```powershell
git push -u origin feature/session-02-verification
```

Git should print a GitHub link for creating a pull request.

## Step 17: Open the Pull Request

1. Open <https://github.com/Dew3120/huddle>.
2. Select **Pull requests**.
3. Select **New pull request**.
4. Set **base** to `feature/session-02-backend-foundation`.
5. Set **compare** to `feature/session-02-verification`.
6. Confirm that **Files changed** contains only `package.json`, `scripts/verify-assignment-02.mjs`, and `docs/assignment-02-verification.md`.
7. Use this title:

```text
Add Assignment 02 API verification runner
```

8. Use this description:

```markdown
## Summary

- adds a dependency-free Assignment 02 API smoke runner
- verifies authentication, authorization, task CRUD, validation, filters, boards, and ownership
- documents the command, coverage, and latest local result

## Verification

- [x] `npm run verify:assignment-02` - 17/17 passed
- [x] `npm run build`
```

9. Select **Create pull request**.
10. Do not merge your own pull request. Dew will review and merge it.
11. Do not create the final Assignment 02 tag. Dew will create it after all team commits are merged.

## Step 18: Send the Review Package to Dew

Send Dew all four items:

1. The pull request link.
2. The screenshot showing `SUCCESS: 17/17 checks passed.`
3. The output from `git log -1 --format="Commit: %h%nAuthor: %an <%ae>%nMessage: %s"`.
4. A short message saying both `npm run verify:assignment-02` and `npm run build` passed.

Your part is complete only after Dew reviews the pull request and confirms it is ready to merge.

## Troubleshooting

### `fetch failed` or `ECONNREFUSED`

The API is not running. Open the second PowerShell window and run:

```powershell
cd C:\Users\VICTUS\Desktop\huddle
npm run start:server
```

Leave it running, then retry `npm run verify:assignment-02` in the first window.

### `JWT_SECRET is required`

Create the local environment file again:

```powershell
Copy-Item .env.example .env -Force
Get-Content .env
```

Then restart the server.

### `EADDRINUSE: address already in use :::4000`

Another process already uses port 4000. First check whether another Huddle server is open in a different terminal. If it is, use that server and do not start a second copy.

To inspect the process:

```powershell
Get-NetTCPConnection -LocalPort 4000 -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess
```

Only if the listed process is your own old Node.js server, stop it with:

```powershell
Stop-Process -Id REPLACE-WITH-OWNING-PROCESS-ID
```

Never stop an unknown process.

### Login returns `429 RATE_LIMITED`

The login route permits five attempts per minute. Wait at least 60 seconds, restart the API, and run the verification once.

### `fetch is not defined`

Your Node.js version is too old. Install the current Node.js LTS release from <https://nodejs.org/>, reopen PowerShell, and confirm `node --version` reports version 20 or newer.

### Git says the feature branch already exists

Run:

```powershell
git checkout feature/session-02-verification
git fetch origin
git merge origin/feature/session-02-backend-foundation
```

Then continue from Step 6.

### Git rejects the push

Confirm the current branch:

```powershell
git branch --show-current
```

It must say `feature/session-02-verification`. Then retry:

```powershell
git push -u origin feature/session-02-verification
```

If GitHub requests authentication, sign in with the GitHub account that is a Huddle collaborator.

### Any verification check fails

Do not rewrite the expected status or delete the failing check. Copy the complete terminal output and send it to Dew. A failing check may reveal a real regression that must be reviewed before submission.

## Reviewer Checklist for Dew

After Rovin opens the pull request, Dew should check:

- The PR base is `feature/session-02-backend-foundation`, not `main`.
- Exactly three intended files changed.
- The commit author is Rovin's GitHub-linked identity.
- `npm run verify:assignment-02` reports `17/17`.
- `npm run build` succeeds.
- The verification record contains the real date and Node version.
- No expected response was weakened just to make a check pass.

After the PR is merged and all team contributions are present, Dew can create the lecturer-required Assignment 02 tag from `feature/session-02-backend-foundation`.
