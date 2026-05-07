import { RequestHandler } from 'express';
import { AuthenticatedRequest } from '../models/auth.types';
import { notificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/apiResponse';

type IdParams = {
  id: string;
};

type AuthenticatedIdRequest = AuthenticatedRequest & {
  params: IdParams;
};

const getAuthenticatedUserId = (req: AuthenticatedRequest): string => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new Error('Authenticated user not found in request');
  }

  return userId;
};

export const notificationController = {
  getMine: (async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = getAuthenticatedUserId(req);

      const notifications = await notificationService.getMyNotifications(userId);

      return sendSuccess(res, notifications, 'Notifications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  markAsRead: (async (req: AuthenticatedIdRequest, res, next) => {
    try {
      const userId = getAuthenticatedUserId(req);

      const notification = await notificationService.markAsRead(req.params.id, userId);

      return sendSuccess(res, notification, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler<IdParams>,
};
