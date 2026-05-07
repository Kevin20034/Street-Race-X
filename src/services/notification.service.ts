import { NotificationType } from '@prisma/client';
import { notificationRepository } from '../repositories/notification.repository';
import { emitToUser } from '../sockets/socket.manager';

export const notificationService = {
  async createAndEmit(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    event: string;
    payload?: unknown;
  }) {
    const notification = await notificationRepository.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
    });

    emitToUser(data.userId, 'notification:new', notification);

    emitToUser(data.userId, data.event, {
      notification,
      payload: data.payload,
    });

    return notification;
  },

  async getMyNotifications(userId: string) {
    return notificationRepository.findByUserId(userId);
  },

  async markAsRead(id: string, userId: string) {
    return notificationRepository.markAsRead(id, userId);
  },
};
