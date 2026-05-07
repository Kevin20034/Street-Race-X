import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Operation completed successfully',
  statusCode = 200,
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};
