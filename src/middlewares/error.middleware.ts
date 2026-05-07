import { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      data: null,
      message: error.message,
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    data: null,
    message: 'Internal server error',
  });
};
