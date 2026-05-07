import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { notificationIdParamSchema } from '../models/notification.schemas';

export const notificationRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification endpoints
 */

notificationRoutes.use(authMiddleware);

/**
 * @swagger
 * /notifications/me:
 *   get:
 *     summary: List authenticated user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Invalid or missing token
 */
notificationRoutes.get('/me', notificationController.getMine);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 *       401:
 *         description: Invalid or missing token
 *       404:
 *         description: Notification not found
 */
notificationRoutes.patch(
  '/:id/read',
  validate(notificationIdParamSchema),
  notificationController.markAsRead,
);
