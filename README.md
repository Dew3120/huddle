\# Huddle



\## Project Description



Huddle is a collaborative task board for small teams to create, assign, move, and sync tasks in real time.



\## Tech Stack



\- Frontend: Next.js (React + TypeScript)

\- Backend: Node.js + Express

\- Database: MongoDB + Mongoose

\- Auth: JWT

\- Real-time: Socket.io

\- Testing: Jest, React Testing Library, Supertest

\- CI/CD: GitHub Actions

\- DevOps: Docker Compose



\## Milestone 1 Scope



\- React-based frontend scaffold

\- Kanban board screen

\- Board, Column, and TaskCard components

\- Mock task data

\- Wireframe

\- Component tree



\## Component Tree



```text

App

+-- KanbanBoardScreen

|   +-- KanbanNavbar

|   +-- KanbanColumn

|       +-- TaskCard

|   +-- TaskModal

|   +-- TaskDetailModal

+-- AuthScreen

&#x20;   +-- LoginForm

&#x20;   +-- SignUpForm

```



\## Backend Constraint



Although Next.js supports API routes, this project will use a separate Node.js + Express backend to match the coursework brief.

