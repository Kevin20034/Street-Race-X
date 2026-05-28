import { describe, expect, it } from 'vitest';
import { AppError } from './AppError';
import { assertVehicleCanBeActivated, getVehicleStatus, VehicleStatus } from './vehicleState';

describe('vehicleState', () => {
  it('maps the active boolean to an enum status', () => {
    expect(getVehicleStatus(true)).toBe(VehicleStatus.ACTIVE);
    expect(getVehicleStatus(false)).toBe(VehicleStatus.INACTIVE);
  });

  it('rejects activating an already active vehicle', () => {
    expect(() => assertVehicleCanBeActivated({ isActive: true })).toThrow(AppError);
    expect(() => assertVehicleCanBeActivated({ isActive: false })).not.toThrow();
  });
});
