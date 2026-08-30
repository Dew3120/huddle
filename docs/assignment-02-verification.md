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

|  # | Area             | Expected behavior                                                  |
| -: | ---------------- | ------------------------------------------------------------------ |
|  1 | Health           | `GET /api/health` returns `200` and `status: ok`                   |
|  2 | Registration     | A new user receives `201`; no password hash is returned            |
|  3 | Duplicate email  | Reusing an email returns `409 EMAIL_EXISTS`                        |
|  4 | Login            | Valid credentials return `200` and a JWT                           |
|  5 | Current user     | `GET /api/auth/me` returns the authenticated public user           |
|  6 | Missing token    | A protected task route returns `401 NO_TOKEN`                      |
|  7 | Invalid token    | A protected task route returns `401 BAD_TOKEN`                     |
|  8 | Task query       | Status, assignee, sort, page, and limit are applied                |
|  9 | Board list       | The authenticated user's board is returned                         |
| 10 | Board task query | Board tasks use the shared filter and pagination contract          |
| 11 | Ownership        | Another user's board is not exposed                                |
| 12 | Validation       | An invalid title returns `400 VALIDATION_ERROR` with field details |
| 13 | Create task      | A valid task returns `201` with a generated id                     |
| 14 | Read task        | The created task can be read by id                                 |
| 15 | Update task      | A status patch returns `200` with the updated task                 |
| 16 | Missing task     | An unknown id returns `404 TASK_NOT_FOUND`                         |
| 17 | Delete task      | Deletion returns `204` with no response body                       |

## Latest Local Result

* Date: August 30, 2026
* Environment: Windows, Node v24.14.0
* Result: PASS (17/17)

## Notes

* The API uses in-memory repositories for Assignment 02, so registered users reset when the server restarts.
* The runner creates a unique temporary user each time.
* The runner deletes the task it creates. It also attempts cleanup if a later check fails.
* This smoke runner complements the committed Postman collection; it does not replace the visual API evidence.
