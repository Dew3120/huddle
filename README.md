# Huddle

## Assignment 01 Front-End Client

Huddle is a collaborative task board for small teams to create, assign, filter, move, edit, and delete tasks. The current repository is aligned with the Assignment 01 / Session 1 front-end scope: a Vite + React client that uses mock data and front-end state.

This version intentionally focuses on the React front end. Backend APIs, authentication, database persistence, real-time sync, automated tests, CI, Docker, and deployment are planned for later milestones.

## Current Status

- The `main` branch contains the merged Assignment 01 front-end foundation.
- Charles's reusable `Button` component work has been merged.
- Vinuka's task search and filtering work has been merged.
- The app builds successfully with `npm run build`.

## Tech Stack

- React
- Vite
- React Router
- Context API and `useReducer`
- JavaScript
- CSS Modules for the shared button component
- Global CSS for the application layout and responsive styling
- Mock task API backed by local data

## Implemented Features

- Three-column task board for `To Do`, `In Progress`, and `Done`.
- Sticky navigation and board summary header while scrolling.
- Mock tasks loaded through an isolated API module.
- Loading, error, retry, empty, and success feedback states.
- Controlled form for adding tasks.
- Validation for required fields, minimum title length, and past due dates.
- Task detail route with validated editing.
- Task detail modal over a blurred board background.
- Immutable task movement between columns.
- Delete confirmation before removing tasks.
- Independent scrolling inside each board column.
- Colored status and assignee pills on task cards and task details.
- Search by task title.
- Filter by assignee, status, and overdue tasks.
- Filter state stored in the URL query string.
- Clear-filters action and no-results state.
- Shared task state managed through Context and reducer actions.
- Reusable `Button` component for consistent button styling.
- Dark theme with glowing cards, buttons, and cursor movement feedback.
- Light theme with blue cursor glow and blue frame glow on hover.
- Route handling for board, new task, task detail/edit, and 404 pages.

## Team Contributions

- Dew / team lead: repository scope alignment, Vite React setup, board foundation, routing, shared task state, task actions, validation, edit flow, integration, and review.
- Charles: reusable `Button` component and shared button styling.
- Vinuka: task search, filter utilities, filter UI, URL query state, result counts, and no-results flow.

## Local Development

Requirements: Node.js and npm.

Install dependencies:

```powershell
npm install
```

Start the local development server:

```powershell
npm run dev
```

Vite usually serves the app at `http://localhost:5173/`. If that port is busy, Vite will print the new local URL in the terminal.

Create a production build:

```powershell
npm run build
```

Preview the production build locally:

```powershell
npm run preview
```

## Routes

```text
/             Board page
/tasks/new    New task page
/tasks/:id    Task detail and edit page
*             Not found page
```

## Project Structure

```text
src/
+-- api/
|   +-- tasks.js
+-- components/
|   +-- AddTaskForm.jsx
|   +-- AppNavigation.jsx
|   +-- Board.jsx
|   +-- Button/
|   |   +-- Button.jsx
|   |   +-- Button.module.css
|   +-- Column.jsx
|   +-- EditTaskForm.jsx
|   +-- ErrorState.jsx
|   +-- LoadingState.jsx
|   +-- TaskCard.jsx
|   +-- TaskFilters.jsx
+-- context/
|   +-- TasksContext.js
|   +-- TasksProvider.jsx
+-- data/
|   +-- mockTasks.js
+-- hooks/
|   +-- useTasks.js
+-- pages/
|   +-- BoardPage.jsx
|   +-- NewTaskPage.jsx
|   +-- NotFoundPage.jsx
|   +-- TaskDetailPage.jsx
+-- utils/
|   +-- filterTasks.js
|   +-- tasksReducer.js
+-- App.jsx
+-- index.css
+-- main.jsx
```

## Component Tree

```text
App
+-- BrowserRouter
    +-- TasksProvider
        +-- AppNavigation
        +-- Routes
            +-- BoardPage
            |   +-- AddTaskForm
            |   +-- TaskFilters
            |   +-- Board
            |       +-- Column
            |           +-- TaskCard
            +-- NewTaskPage
            |   +-- AddTaskForm
            +-- TaskDetailPage
            |   +-- EditTaskForm
            +-- NotFoundPage
```

## Wireframes / Visual Mockups

The existing images are kept as planning wireframes and visual reference material. They can be used as design frameworks for explaining the intended interface, but they should not be presented as final screenshots of the running app.

If final proof screenshots are required for submission, run the app locally and capture current screenshots from the Vite app. Those can be added later under `docs/screenshots/`.

### Kanban Board

![Kanban board v0 mockup](docs/wireframes/kanban-board-v0-mockup.png)

### Create Task Flow

![Create task modal v0 mockup](docs/wireframes/task-modal-v0-mockup.png)

### Task Detail Flow

![Task detail modal v0 mockup](docs/wireframes/task-detail-modal-v0-mockup.png)

### Edit Task Flow

![Edit task modal v0 mockup](docs/wireframes/edit-task-modal-v0-mockup.png)

### Auth Planning Screens

![Auth screen v0 mockup](docs/wireframes/auth-screen-v0-mockup.png)

![Sign-up screen v0 mockup](docs/wireframes/signup-screen-v0-mockup.png)

## Manual Verification Checklist

- Install dependencies with `npm install`.
- Confirm the production build passes with `npm run build`.
- Load the board and confirm mock tasks appear in the correct columns.
- Add a valid task and confirm it appears on the board.
- Try invalid task data and confirm validation messages appear.
- Move tasks between `To Do`, `In Progress`, and `Done`.
- Delete a task and confirm the browser asks for confirmation.
- Open a task detail page.
- Edit a task and confirm the updated values are shown.
- Use title search and assignee, status, and overdue filters.
- Refresh the page with filters active and confirm query-string filters remain.
- Clear filters and confirm all tasks return.
- Visit an unknown route and confirm the 404 page appears.

## Current Limitations

- Tasks are loaded from mock data instead of a real backend.
- Changes are stored in front-end state only and reset when the page reloads.
- Authentication and user accounts are not implemented in this milestone.
- Database persistence is not implemented in this milestone.
- Real-time updates are not implemented in this milestone.
- Automated tests, CI, Docker, and public deployment are not part of the current submission.

## Future Milestones

- Add an Express API for task and user data.
- Add MongoDB persistence.
- Add authentication and protected routes.
- Connect the React client to the backend API.
- Add automated tests and CI checks.
- Add deployment documentation.
