import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../models/auth.types';
import { AppError } from '../utils/AppError';
import { verifyToken } from '../utils/jwt';

export const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next(new AppError('Authorization header is required', 401));
    return;
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    next(new AppError('Invalid authorization format', 401));
    return;
  }

  try {
    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }

  }

