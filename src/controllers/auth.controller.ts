import { RequestHandler } from 'express';
import { AuthenticatedRequest } from '../models/auth.types';
import { LoginInput, RegisterInput } from '../models/auth.schemas';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/apiResponse';

export const authController = {
  register: (async (req, res, next) => {
    try {
      const result = await authService.register(req.body as RegisterInput);

      return sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  login: (async (req, res, next) => {
    try {
      const result = await authService.login(req.body as LoginInput);

      return sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  me: (async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new Error('Authenticated user not found in request');
      }

      const result = await authService.me(userId);

      return sendSuccess(res, result, 'Authenticated user profile');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,
};
