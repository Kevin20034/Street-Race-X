import { z } from 'zod';

export const challengeIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid challenge id'),
  }),
});

export const createChallengeSchema = z.object({
  body: z.object({
    receiverId: z.string().uuid('Invalid receiver id'),
    senderVehicleId: z.string().uuid('Invalid sender vehicle id'),
    receiverVehicleId: z.string().uuid('Invalid receiver vehicle id').optional(),
    categoryId: z.string().uuid('Invalid category id').optional(),
    message: z.string().max(500).optional(),
    location: z.string().max(200).optional(),
    scheduledAt: z.string().datetime().optional(),
  }),
});

export const completeChallengeSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid challenge id'),
  }),
  body: z.object({
    winnerId: z.string().uuid('Invalid winner id'),
  }),
});

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>['body'];
export type CompleteChallengeInput = z.infer<typeof completeChallengeSchema>['body'];
