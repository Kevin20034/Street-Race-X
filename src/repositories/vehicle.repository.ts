import { VehicleType } from '@prisma/client';
import { prisma } from '../config/prisma';

const vehicleSelect = {
  id: true,
  userId: true,
  name: true,
  brand: true,
  model: true,
  year: true,
  type: true,
  horsepower: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export const vehicleRepository = {
  countByUserId(userId: string) {
    return prisma.vehicle.count({
      where: { userId },
    });
  },

  findById(id: string) {
    return prisma.vehicle.findUnique({
      where: { id },
      select: vehicleSelect,
    });
  },

  findByUserId(userId: string) {
    return prisma.vehicle.findMany({
      where: { userId },
      select: vehicleSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  create(data: {
    userId: string;
    name: string;
    brand: string;
    model: string;
    year: number;
    type: VehicleType;
    horsepower: number;
  }) {
    return prisma.vehicle.create({
      data,
      select: vehicleSelect,
    });
  },

  update(
    id: string,
    data: {
      name?: string;
      brand?: string;
      model?: string;
      year?: number;
      type?: VehicleType;
      horsepower?: number;
    },
  ) {
    return prisma.vehicle.update({
      where: { id },
      data,
      select: vehicleSelect,
    });
  },

  delete(id: string) {
    return prisma.vehicle.delete({
      where: { id },
      select: vehicleSelect,
    });
  },

  deactivateAllByUserId(userId: string) {
    return prisma.vehicle.updateMany({
      where: { userId },
      data: {
        isActive: false,
      },
    });
  },

  activate(id: string) {
    return prisma.vehicle.update({
      where: { id },
      data: {
        isActive: true,
      },
      select: vehicleSelect,
    });
  },
};
