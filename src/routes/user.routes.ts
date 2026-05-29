import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { ownerOrAdminMiddleware } from '../middlewares/ownerOrAdmin.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateUserSchema, userIdParamSchema } from '../models/user.schemas';

export const userRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and administration endpoints
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Admin role required
 */
userRoutes.get('/', authMiddleware, roleMiddleware('ADMIN'), userController.getAll);

/**
 * @swagger
 * /users/racers:
 *   get:
 *     summary: List available racers for challenges
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Racers retrieved successfully
 *       401:
 *         description: Invalid or missing token
 */
userRoutes.get('/racers', authMiddleware, userController.getRacers);

/**
 * @swagger
 * /users/{id}/public:
 *   get:
 *     summary: Get public user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Public profile retrieved successfully
 *       404:
 *         description: User not found
 */
userRoutes.get('/:id/public', validate(userIdParamSchema), userController.getPublicProfile);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by id
 *     tags: [Users]
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
 *         description: User retrieved successfully
 *       401:
 *         description: Invalid or missing token
 *       403:
 *         description: Not allowed
 *       404:
 *         description: User not found
 */
userRoutes.get(
  '/:id',
  authMiddleware,
  validate(userIdParamSchema),
  ownerOrAdminMiddleware,
  userController.getById,
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user
 *     tags: [Users]
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
 *                 example: Kevin X
 *               email:
 *                 type: string
 *                 example: kevinx@test.com
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Not allowed
 *       404:
 *         description: User not found
 */
userRoutes.patch(
  '/:id',
  authMiddleware,
  validate(updateUserSchema),
  ownerOrAdminMiddleware,
  userController.update,
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Soft delete user
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       403:
 *         description: Admin role required
 *       404:
 *         description: User not found
 */
userRoutes.delete(
  '/:id',
  authMiddleware,
  validate(userIdParamSchema),
  roleMiddleware('ADMIN'),
  userController.delete,
);
