import { z } from 'zod';

const statusSchema = z.enum(['todo', 'in-progress', 'done']);

const sortSchema = z.enum([
  'title',
  '-title',
  'assignee',
  '-assignee',
  'status',
  '-status',
  'dueDate',
  '-dueDate',
]);

function isRealCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isTodayOrLater(value) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(`${value}T00:00:00`) >= today;
}

const calendarDateSchema = z
  .string()
  .trim()
  .refine(isRealCalendarDate, {
    message: 'Due date must be a real date in YYYY-MM-DD format',
  });

const createDueDateSchema = calendarDateSchema.refine(isTodayOrLater, {
  message: 'Due date cannot be in the past',
});

export const taskQuerySchema = z
  .object({
    status: statusSchema.optional(),
    assignee: z.string().trim().min(1).optional(),
    sort: sortSchema.default('dueDate'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters'),
    assignee: z.string().trim().min(1, 'Assignee is required'),
    status: statusSchema.default('todo'),
    dueDate: createDueDateSchema,
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').optional(),
    assignee: z.string().trim().min(1, 'Assignee is required').optional(),
    status: statusSchema.optional(),
    dueDate: calendarDateSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one task field is required',
  });
