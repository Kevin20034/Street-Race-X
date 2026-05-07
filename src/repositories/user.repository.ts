import { Rank } from '@prisma/client';
import { prisma } from '../config/prisma';

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  rank: true,
  consecutiveWins: true,
  totalWins: true,
  totalLosses: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  findSafeById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });
  },

  findPublicById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        rank: true,
        totalWins: true,
        totalLosses: true,
        vehicles: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            brand: true,
            model: true,
            year: true,
            type: true,
            horsepower: true,
          },
        },
      },
    });
  },

  findAll() {
    return prisma.user.findMany({
      select: safeUserSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  create(data: { name: string; email: string; password: string }) {
    return prisma.user.create({
      data,
      select: safeUserSelect,
    });
  },

  update(id: string, data: { name?: string; email?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: safeUserSelect,
    });
  },

  softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
      select: safeUserSelect,
    });
  },

  updateWinnerStats(id: string, data: { rank: Rank; consecutiveWins: number }) {
    return prisma.user.update({
      where: { id },
      data: {
        rank: data.rank,
        consecutiveWins: data.consecutiveWins,
        totalWins: {
          increment: 1,
        },
      },
    });
  },

  updateLoserStats(id: string, consecutiveWins: number) {
    return prisma.user.update({
      where: { id },
      data: {
        consecutiveWins,
        totalLosses: {
          increment: 1,
        },
      },
    });
  },
};
