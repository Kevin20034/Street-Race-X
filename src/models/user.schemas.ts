import { z } from 'zod';

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user id'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user id'),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must have at least 2 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
  }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
