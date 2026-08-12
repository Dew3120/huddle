export type TagKey = 'Frontend' | 'Backend' | 'Design' | 'DevOps' | 'Testing' | 'Docs';
export type ColumnId = 'todo' | 'doing' | 'done';

export interface Teammate {
  id: string;
  name: string;
  initials: string;
  color: string; // Tailwind bg class
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  tag: TagKey;
  assigneeId: string;
  columnId: ColumnId;
  createdAt: string;
}

export const TAG_STYLES: Record<TagKey, string> = {
  Frontend: 'tag-frontend',
  Backend:  'tag-backend',
  Design:   'tag-design',
  DevOps:   'tag-devops',
  Testing:  'tag-testing',
  Docs:     'tag-docs',
};

export const COLUMN_LABELS: Record<ColumnId, string> = {
  todo:  'To Do',
  doing: 'Doing',
  done:  'Done',
};

export const COLUMN_ORDER: ColumnId[] = ['todo', 'doing', 'done'];

export const TEAMMATES: Teammate[] = [
  { id: 'tm-kai',   name: 'Kai Reyes',    initials: 'KR', color: 'bg-violet-500' },
  { id: 'tm-sana',  name: 'Sana Lim',     initials: 'SL', color: 'bg-pink-500'   },
  { id: 'tm-arjun', name: 'Arjun Patel',  initials: 'AP', color: 'bg-emerald-500'},
  { id: 'tm-mei',   name: 'Mei Tanaka',   initials: 'MT', color: 'bg-sky-500'    },
  { id: 'tm-omar',  name: 'Omar Hassan',  initials: 'OH', color: 'bg-orange-500' },
];

export const INITIAL_TASKS: Task[] = [
  // To Do
  { id: 'task-001', title: 'Implement JWT refresh token rotation',       description: 'Update the auth middleware to handle silent refresh and revoke old tokens on use.', tag: 'Backend',  assigneeId: 'tm-arjun', columnId: 'todo',  createdAt: '2026-08-08' },
  { id: 'task-002', title: 'Design empty state illustrations',            description: 'Create SVG illustrations for empty board, empty column, and no search results states.', tag: 'Design',   assigneeId: 'tm-sana',  columnId: 'todo',  createdAt: '2026-08-08' },
  { id: 'task-003', title: 'Set up Playwright e2e test suite',             description: 'Bootstrap Playwright with test coverage for auth flow, task creation, and column drag.',  tag: 'Testing',  assigneeId: 'tm-mei',   columnId: 'todo',  createdAt: '2026-08-09' },
  { id: 'task-004', title: 'Write API integration docs for webhooks',      description: 'Document all outbound webhook events with example payloads in the developer portal.',   tag: 'Docs',     assigneeId: 'tm-omar',  columnId: 'todo',  createdAt: '2026-08-09' },
  { id: 'task-005', title: 'Add dark mode support to design system',       description: 'Extend the Tailwind config with dark-mode token overrides and update all components.',   tag: 'Frontend', assigneeId: 'tm-kai',   columnId: 'todo',  createdAt: '2026-08-10' },

  // Doing
  { id: 'task-006', title: 'Build drag-and-drop Kanban board',             description: 'Implement column-to-column card drag using native HTML5 DnD API with touch fallback.', tag: 'Frontend', assigneeId: 'tm-kai',   columnId: 'doing', createdAt: '2026-08-07' },
  { id: 'task-007', title: 'Set up GitHub Actions CI pipeline',            description: 'Configure lint, type-check, and test jobs triggered on every PR to main.',               tag: 'DevOps',   assigneeId: 'tm-arjun', columnId: 'doing', createdAt: '2026-08-07' },
  { id: 'task-008', title: 'Redesign task card component',                 description: 'New card layout with tag pill, avatar, priority indicator, and hover action row.',       tag: 'Design',   assigneeId: 'tm-sana',  columnId: 'doing', createdAt: '2026-08-08' },
  { id: 'task-009', title: 'Integrate Sentry error monitoring',            description: 'Add Sentry SDK, configure source maps upload, and set up alert routing rules.',          tag: 'DevOps',   assigneeId: 'tm-mei',   columnId: 'doing', createdAt: '2026-08-09' },

  // Done
  { id: 'task-010', title: 'Scaffold Next.js project with Tailwind',       description: 'Initialize repo, configure Tailwind with custom tokens, set up folder structure.',      tag: 'Frontend', assigneeId: 'tm-kai',   columnId: 'done',  createdAt: '2026-08-05' },
  { id: 'task-011', title: 'Design login and sign-up screens',             description: 'Figma mockups for auth screens, reviewed and approved by team.',                        tag: 'Design',   assigneeId: 'tm-sana',  columnId: 'done',  createdAt: '2026-08-05' },
  { id: 'task-012', title: 'Set up PostgreSQL schema for tasks',           description: 'Define tables: users, tasks, columns. Migrations written and reviewed.',                tag: 'Backend',  assigneeId: 'tm-arjun', columnId: 'done',  createdAt: '2026-08-06' },
  { id: 'task-013', title: 'Configure Vercel preview deployments',         description: 'Every PR now gets a unique preview URL with environment variables injected.',           tag: 'DevOps',   assigneeId: 'tm-omar',  columnId: 'done',  createdAt: '2026-08-06' },
  { id: 'task-014', title: 'Write unit tests for task reducer',            description: 'Jest tests covering add, move, edit, and delete operations with 100% coverage.',        tag: 'Testing',  assigneeId: 'tm-mei',   columnId: 'done',  createdAt: '2026-08-07' },
];