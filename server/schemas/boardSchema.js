import { z } from 'zod';

export const createBoardSchema = z
  .object({
    name: z.string().trim().min(3, 'Board name must be at least 3 characters'),
  })
  .strict();