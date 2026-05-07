import { Router } from 'express';
import { vehicleController } from '../controllers/vehicle.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdParamSchema,
} from '../models/vehicle.schemas';

export const vehicleRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Vehicle management endpoints
 */

vehicleRoutes.use(authMiddleware);

/**
 * @swagger
 * /vehicles:
 *   post:
 *     summary: Create a vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - brand
 *               - model
 *               - year
 *               - type
 *               - horsepower
 *             properties:
 *               name:
 *                 type: string
 *                 example: Night Fury
 *               brand:
 *                 type: string
 *                 example: Nissan
 *               model:
 *                 type: string
 *                 example: Skyline R34
 *               year:
 *                 type: integer
 *                 example: 1999
 *               type:
 *                 type: string
 *                 enum: [CAR, MOTORCYCLE]
 *                 example: CAR
 *               horsepower:
 *                 type: integer
 *                 example: 480
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *       400:
 *         description: Validation error or maximum vehicles reached
 */
vehicleRoutes.post('/', validate(createVehicleSchema), vehicleController.create);

/**
 * @swagger
 * /vehicles/me:
 *   get:
 *     summary: List authenticated user's vehicles
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vehicles retrieved successfully
 */
vehicleRoutes.get('/me', vehicleController.getMine);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Get vehicle by id
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vehicle retrieved successfully
 *       404:
 *         description: Vehicle not found
 */
vehicleRoutes.get('/:id', validate(vehicleIdParamSchema), vehicleController.getById);

/**
 * @swagger
 * /vehicles/{id}:
 *   patch:
 *     summary: Update vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Night Fury V2
 *               brand:
 *                 type: string
 *                 example: Nissan
 *               model:
 *                 type: string
 *                 example: Skyline R34
 *               year:
 *                 type: integer
 *                 example: 1999
 *               type:
 *                 type: string
 *                 enum: [CAR, MOTORCYCLE]
 *                 example: CAR
 *               horsepower:
 *                 type: integer
 *                 example: 520
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *       403:
 *         description: Not allowed
 *       404:
 *         description: Vehicle not found
 */
vehicleRoutes.patch('/:id', validate(updateVehicleSchema), vehicleController.update);

/**
 * @swagger
 * /vehicles/{id}/activate:
 *   patch:
 *     summary: Activate a vehicle and deactivate the others
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vehicle activated successfully
 *       403:
 *         description: Not allowed
 *       404:
 *         description: Vehicle not found
 */
vehicleRoutes.patch(
  '/:id/activate',
  validate(vehicleIdParamSchema),
  vehicleController.activate,
);

/**
 * @swagger
 * /vehicles/{id}:
 *   delete:
 *     summary: Delete vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 *       403:
 *         description: Not allowed
 *       404:
 *         description: Vehicle not found
 */
vehicleRoutes.delete('/:id', validate(vehicleIdParamSchema), vehicleController.delete);
