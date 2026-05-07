import { z } from 'zod';

export const vehicleIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid vehicle id'),
  }),
});

export const createVehicleSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must have at least 2 characters'),
    brand: z.string().min(2, 'Brand must have at least 2 characters'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().int().min(1950).max(new Date().getFullYear() + 1),
    type: z.enum(['CAR', 'MOTORCYCLE']),
    horsepower: z.number().int().min(1),
  }),
});

export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid vehicle id'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    brand: z.string().min(2).optional(),
    model: z.string().min(1).optional(),
    year: z.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
    type: z.enum(['CAR', 'MOTORCYCLE']).optional(),
    horsepower: z.number().int().min(1).optional(),
  }),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>['body'];
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>['body'];
