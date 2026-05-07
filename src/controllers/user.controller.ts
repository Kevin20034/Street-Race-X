import { RequestHandler } from 'express';
import { UpdateUserInput } from '../models/user.schemas';
import { userService } from '../services/user.service';
import { sendSuccess } from '../utils/apiResponse';

type IdParams = {
  id: string;
};

export const userController = {
  getAll: (async (_req, res, next) => {
    try {
      const users = await userService.getAllUsers();

      return sendSuccess(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getById: (async (req, res, next) => {
    try {
      const user = await userService.getUserById(req.params.id);

      return sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler<IdParams>,

  getPublicProfile: (async (req, res, next) => {
    try {
      const user = await userService.getPublicProfile(req.params.id);

      return sendSuccess(res, user, 'Public profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler<IdParams>,

  update: (async (req, res, next) => {
    try {
      const user = await userService.updateUser(req.params.id, req.body as UpdateUserInput);

      return sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler<IdParams>,

  delete: (async (req, res, next) => {
    try {
      const user = await userService.deleteUser(req.params.id);

      return sendSuccess(res, user, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler<IdParams>,
};
