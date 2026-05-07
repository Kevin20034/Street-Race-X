import { RequestHandler } from 'express';
import { AppError } from '../utils/AppError';

export const notFoundMiddleware: RequestHandler = (req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};
