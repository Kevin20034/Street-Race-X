import { Router } from 'express';
import { sendSuccess } from '../utils/apiResponse';

export const healthRoutes = Router();

healthRoutes.get('/', (_req, res) => {
  return sendSuccess(
    res,
    {
      service: 'Street Race X API',
      status: 'OK',
      timestamp: new Date().toISOString(),
    },
    'API is running',
  );
});
