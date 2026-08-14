# Huddle

## Project Description

Huddle is a collaborative task board for small teams to create, assign, move, and sync tasks in real time.

## Tech Stack

- Frontend: Next.js (React + TypeScript)
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT
- Real-time: Socket.io
- Testing: Jest, React Testing Library, Supertest
- CI/CD: GitHub Actions
- DevOps: Docker Compose

## Milestone 1 Scope

- React-based frontend scaffold
- Kanban board screen
- Board, Column, and TaskCard components
- Mock task data
- Wireframes / visual mockups
- Component tree

## Milestone 2 Scope

- Separate Node.js and Express REST API
- Routes, controllers, models, and authentication middleware
- User registration and login with JWT authentication
- Protected task CRUD endpoints
- Frontend forms and Kanban actions connected to the API
- Optimistic version checks that return HTTP 409 for stale updates
- Manual browser and API verification

See the [API contract](docs/api-contract.md) for the endpoint definitions.

## Local Development

Requirements: Node.js 20 or newer and npm.

1. Install the frontend dependencies:

   ```powershell
   npm install
   ```

2. Install the backend dependencies:

   ```powershell
   cd server
   npm install
   Copy-Item .env.example .env
   ```

3. Set a private `JWT_SECRET` in `server/.env`.

4. Start the API from the `server` directory:

   ```powershell
   npm run dev
   ```

5. In another terminal, start the frontend from the repository root:

   ```powershell
   npm run dev
   ```

The frontend runs at `http://localhost:3000` and the API runs at
`http://localhost:5000` by default.

## Component Tree

```text
src/app/layout.tsx
+-- src/app/page.tsx
|   +-- AuthScreen
|       +-- LoginForm
|       +-- SignUpForm
+-- src/app/sign-up-login-screen/page.tsx
|   +-- AuthScreen
|       +-- LoginForm
|       +-- SignUpForm
+-- src/app/kanban-board/page.tsx
    +-- KanbanBoardScreen
        +-- KanbanNavbar
        |   +-- AppLogo
        +-- KanbanColumn
        |   +-- TaskCard
        +-- TaskModal
        +-- TaskDetailModal

Shared UI components:
+-- AppLogo
|   +-- AppImage
|   +-- AppIcon
+-- AppImage
+-- AppIcon
```

## Wireframes / Visual Mockups

The following v0 mockups were used as visual references for the Milestone 1 frontend skeleton.

### Auth Screen

![Auth screen v0 mockup](docs/wireframes/auth-screen-v0-mockup.png)

### Sign-Up Screen

![Sign-up screen v0 mockup](docs/wireframes/signup-screen-v0-mockup.png)

### Kanban Board

![Kanban board v0 mockup](docs/wireframes/kanban-board-v0-mockup.png)

### Create Task Modal

![Create task modal v0 mockup](docs/wireframes/task-modal-v0-mockup.png)

### Task Detail Modal

![Task detail modal v0 mockup](docs/wireframes/task-detail-modal-v0-mockup.png)

### Edit Task Modal

![Edit task modal v0 mockup](docs/wireframes/edit-task-modal-v0-mockup.png)

## Backend Constraint

Although Next.js supports API routes, this project will use a separate Node.js + Express backend to match the coursework brief.

## Current Limitations

- Milestone 2 stores users and tasks in server memory, so data resets when the API restarts. MongoDB persistence is planned for Milestone 3.
- Automated tests, real-time Socket.io updates, Docker Compose, CI, and public deployment are later milestone work.
