import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../models/auth.types';
import { AppError } from '../utils/AppError';

export const ownerOrAdminMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    next(new AppError('User is not authenticated', 401));
    return;
  }

  const targetUserId = req.params.id;

  if (req.user.role !== 'ADMIN' && req.user.userId !== targetUserId) {
    next(new AppError('You can only access your own user resource', 403));
    return;
  }

  next();
};
