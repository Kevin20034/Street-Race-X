import { AppError } from './AppError';

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export const getVehicleStatus = (isActive: boolean): VehicleStatus => {
  return isActive ? VehicleStatus.ACTIVE : VehicleStatus.INACTIVE;
};

export const assertVehicleCanBeActivated = (vehicle: { isActive: boolean }): void => {
  if (getVehicleStatus(vehicle.isActive) === VehicleStatus.ACTIVE) {
    throw new AppError('Vehicle is already active', 400);
  }
};
