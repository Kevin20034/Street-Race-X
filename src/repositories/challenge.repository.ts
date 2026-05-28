import { ChallengeStatus } from '@prisma/client';
import { prisma } from '../config/prisma';

const challengeInclude = {
  sender: {
    select: {
      id: true,
      name: true,
      rank: true,
    },
  },
  receiver: {
    select: {
      id: true,
      name: true,
      rank: true,
    },
  },
  senderVehicle: true,
  receiverVehicle: true,
  winner: {
    select: {
      id: true,
      name: true,
      rank: true,
    },
  },
  category: true,
};

export const challengeRepository = {
  create(data: {
    senderId: string;
    receiverId: string;
    senderVehicleId: string;
    receiverVehicleId?: string;
    categoryId?: string;
    message?: string;
    location?: string;
    scheduledAt?: Date;
  }) {
    return prisma.challenge.create({
      data,
      include: challengeInclude,
    });
  },

  findById(id: string) {
    return prisma.challenge.findUnique({
      where: { id },
      include: challengeInclude,
    });
  },

  findByUserId(userId: string) {
    return prisma.challenge.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: challengeInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  updateStatus(id: string, status: ChallengeStatus) {
    return prisma.challenge.update({
      where: { id },
      data: { status },
      include: challengeInclude,
    });
  },

  complete(id: string, winnerId: string) {
    return prisma.challenge.update({
      where: { id },
      data: {
        status: ChallengeStatus.COMPLETED,
        winnerId,
        completedAt: new Date(),
      },
      include: challengeInclude,
    });
  },
};
