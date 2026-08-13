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

## Component Tree

```text
App
+-- KanbanBoardScreen
|   +-- KanbanNavbar
|   +-- KanbanColumn
|       +-- TaskCard
|   +-- TaskModal
|   +-- TaskDetailModal
+-- AuthScreen
    +-- LoginForm
    +-- SignUpForm
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
