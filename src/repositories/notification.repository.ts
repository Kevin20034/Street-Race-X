import { NotificationType } from '@prisma/client';
import { prisma } from '../config/prisma';

const notificationSelect = {
  id: true,
  userId: true,
  type: true,
  title: true,
  message: true,
  read: true,
  createdAt: true,
};

export const notificationRepository = {
  create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
  }) {
    return prisma.notification.create({
      data,
      select: notificationSelect,
    });
  },

  findByUserId(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      select: notificationSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  markAsRead(id: string, userId: string) {
    return prisma.notification.update({
      where: { id, userId },
      data: {
        read: true,
      },
      select: notificationSelect,
    });
  },
};
