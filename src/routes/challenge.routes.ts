import { Router } from 'express';
import { challengeController } from '../controllers/challenge.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  challengeIdParamSchema,
  completeChallengeSchema,
  createChallengeSchema,
} from '../models/challenge.schemas';

export const challengeRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Challenges
 *   description: Racing challenge endpoints
 */

challengeRoutes.use(authMiddleware);

/**
 * @swagger
 * /challenges:
 *   post:
 *     summary: Create a challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - senderVehicleId
 *             properties:
 *               receiverId:
 *                 type: string
 *                 format: uuid
 *                 example: 8a6d45f3-1f60-440c-a3b5-cc79caa4e2fc
 *               senderVehicleId:
 *                 type: string
 *                 format: uuid
 *                 example: 534b166c-aa76-4bf5-acb8-5570c2d85cfc
 *               receiverVehicleId:
 *                 type: string
 *                 format: uuid
 *                 example: 475cb0a0-a960-4828-aa8a-080aefe38d21
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               message:
 *                 type: string
 *                 example: Carrera esta noche
 *               location:
 *                 type: string
 *                 example: Avenida Central
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-05-06T22:00:00.000Z"
 *     responses:
 *       201:
 *         description: Challenge created successfully
 *       400:
 *         description: Business rule validation failed
 *       403:
 *         description: Not allowed
 *       404:
 *         description: Sender, receiver, or vehicle not found
 */
challengeRoutes.post('/', validate(createChallengeSchema), challengeController.create);

/**
 * @swagger
 * /challenges/me:
 *   get:
 *     summary: List authenticated user's challenges
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Challenges retrieved successfully
 */
challengeRoutes.get('/me', challengeController.getMine);

/**
 * @swagger
 * /challenges/{id}/accept:
 *   patch:
 *     summary: Accept a pending challenge
 *     tags: [Challenges]
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
 *         description: Challenge accepted successfully
 *       400:
 *         description: Only pending challenges can be accepted
 *       403:
 *         description: Only the receiver can accept this challenge
 *       404:
 *         description: Challenge not found
 */
challengeRoutes.patch(
  '/:id/accept',
  validate(challengeIdParamSchema),
  challengeController.accept,
);

/**
 * @swagger
 * /challenges/{id}/reject:
 *   patch:
 *     summary: Reject a pending challenge
 *     tags: [Challenges]
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
 *         description: Challenge rejected successfully
 *       400:
 *         description: Only pending challenges can be rejected
 *       403:
 *         description: Only the receiver can reject this challenge
 *       404:
 *         description: Challenge not found
 */
challengeRoutes.patch(
  '/:id/reject',
  validate(challengeIdParamSchema),
  challengeController.reject,
);

/**
 * @swagger
 * /challenges/{id}/cancel:
 *   patch:
 *     summary: Cancel a pending challenge
 *     tags: [Challenges]
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
 *         description: Challenge cancelled successfully
 *       400:
 *         description: Only pending challenges can be cancelled
 *       403:
 *         description: Only the sender can cancel this challenge
 *       404:
 *         description: Challenge not found
 */
challengeRoutes.patch(
  '/:id/cancel',
  validate(challengeIdParamSchema),
  challengeController.cancel,
);

/**
 * @swagger
 * /challenges/{id}/complete:
 *   patch:
 *     summary: Complete an accepted challenge and define winner
 *     tags: [Challenges]
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
 *             required:
 *               - winnerId
 *             properties:
 *               winnerId:
 *                 type: string
 *                 format: uuid
 *                 example: 4bfa6437-d8ab-41b7-8b27-d6ae9d8b231d
 *     responses:
 *       200:
 *         description: Challenge completed successfully
 *       400:
 *         description: Challenge cannot be completed
 *       403:
 *         description: Only participants can complete this challenge
 *       404:
 *         description: Challenge not found
 */
challengeRoutes.patch(
  '/:id/complete',
  validate(completeChallengeSchema),
  challengeController.complete,
);
