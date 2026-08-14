# Huddle API Contract

## Base URL

Local development: `http://localhost:5000/api`

JSON is used for request and response bodies. Protected endpoints require:

```http
Authorization: Bearer <jwt-token>
```

Errors use this shape:

```json
{
  "message": "Human-readable error message"
}
```

## Health

### `GET /health`

Returns HTTP 200 when the API is running.

## Authentication

### `POST /auth/register`

Creates a user and returns HTTP 201 with the user and JWT.

```json
{
  "name": "Kai Reyes",
  "email": "kai@example.com",
  "password": "Huddle123!"
}
```

### `POST /auth/login`

Returns HTTP 200 with the user and JWT when the credentials are valid.

```json
{
  "email": "kai@example.com",
  "password": "Huddle123!"
}
```

## Tasks

All task endpoints are protected.

### `GET /tasks`

Returns HTTP 200 with an array of tasks.

### `GET /tasks/:id`

Returns HTTP 200 with one task, or HTTP 404 when it does not exist.

### `POST /tasks`

Creates a task and returns HTTP 201.

```json
{
  "title": "Connect the Kanban board",
  "description": "Use the protected Express task endpoints.",
  "tag": "Backend",
  "assigneeId": "tm-kai",
  "columnId": "todo"
}
```

### `PATCH /tasks/:id`

Updates supplied task fields and returns HTTP 200. Clients include the task's
current `version` to prevent silent overwrites.

```json
{
  "columnId": "doing",
  "version": 1
}
```

If the supplied version is stale, the API returns HTTP 409 with the latest task:

```json
{
  "message": "Task was updated by another user",
  "currentTask": {}
}
```

### `DELETE /tasks/:id`

Deletes a task and returns HTTP 200 with `{ "message": "Task deleted" }`.

## Common Status Codes

| Status | Meaning |
| --- | --- |
| 200 | Request succeeded |
| 201 | Resource created |
| 400 | Validation failed |
| 401 | Authentication failed |
| 404 | Resource or route not found |
| 409 | Duplicate account or conflicting task update |
| 500 | Unexpected server error |
