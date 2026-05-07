import { VehicleType } from '@prisma/client';
import { CreateVehicleInput, UpdateVehicleInput } from '../models/vehicle.schemas';
import { vehicleRepository } from '../repositories/vehicle.repository';
import { AppError } from '../utils/AppError';

export const vehicleService = {
  async createVehicle(userId: string, input: CreateVehicleInput) {
    const vehicleCount = await vehicleRepository.countByUserId(userId);

    if (vehicleCount >= 3) {
      throw new AppError('A user can have a maximum of 3 vehicles', 400);
    }

    return vehicleRepository.create({
      userId,
      name: input.name,
      brand: input.brand,
      model: input.model,
      year: input.year,
      type: input.type as VehicleType,
      horsepower: input.horsepower,
    });
  },

  async getMyVehicles(userId: string) {
    return vehicleRepository.findByUserId(userId);
  },

  async getVehicleById(id: string) {
    const vehicle = await vehicleRepository.findById(id);

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    return vehicle;
  },

  async updateVehicle(userId: string, id: string, input: UpdateVehicleInput) {
    const vehicle = await vehicleRepository.findById(id);

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    if (vehicle.userId !== userId) {
      throw new AppError('You can only update your own vehicles', 403);
    }

    return vehicleRepository.update(id, {
      ...input,
      type: input.type as VehicleType | undefined,
    });
  },

  async deleteVehicle(userId: string, id: string) {
    const vehicle = await vehicleRepository.findById(id);

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    if (vehicle.userId !== userId) {
      throw new AppError('You can only delete your own vehicles', 403);
    }

    return vehicleRepository.delete(id);
  },

  async activateVehicle(userId: string, id: string) {
    const vehicle = await vehicleRepository.findById(id);

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }

    if (vehicle.userId !== userId) {
      throw new AppError('You can only activate your own vehicles', 403);
    }

    await vehicleRepository.deactivateAllByUserId(userId);

    return vehicleRepository.activate(id);
  },
};
