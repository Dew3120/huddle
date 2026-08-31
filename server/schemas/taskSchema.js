import { z } from 'zod';

const statusSchema = z.enum(['todo', 'in-progress', 'done']);

const dueDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must use YYYY-MM-DD format')
  .refine((value) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(`${value}T00:00:00`);
    return dueDate >= today;
  }, 'Due date cannot be in the past');

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters'),
    assignee: z.string().trim().min(1, 'Assignee is required'),
    status: statusSchema.default('todo'),
    dueDate: dueDateSchema,
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').optional(),
    assignee: z.string().trim().min(1, 'Assignee is required').optional(),
    status: statusSchema.optional(),
    dueDate: dueDateSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one task field is required',
  });
