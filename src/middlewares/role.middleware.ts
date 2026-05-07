import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../models/auth.types';
import { AppError } from '../utils/AppError';

export const roleMiddleware =
  (...allowedRoles: string[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('User is not authenticated', 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError('You do not have permission to access this resource', 403));
      return;
    }

    next();
  };
