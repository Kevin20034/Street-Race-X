import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../utils/AppError';
import { vehicleService } from './vehicle.service';

const mocks = vi.hoisted(() => ({
  vehicleRepository: {
    findAll: vi.fn(),
    countByUserId: vi.fn(),
    create: vi.fn(),
    findByUserId: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deactivateAllByUserId: vi.fn(),
    activate: vi.fn(),
  },
}));

vi.mock('../repositories/vehicle.repository', () => ({
  vehicleRepository: mocks.vehicleRepository,
}));

const inactiveVehicle = {
  id: 'vehicle-1',
  userId: 'user-1',
  name: 'Night Fury',
  brand: 'Nissan',
  model: 'Skyline R34',
  year: 1999,
  type: 'CAR',
  horsepower: 480,
  isActive: false,
};

describe('vehicleService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates a vehicle when the user has less than three vehicles', async () => {
    mocks.vehicleRepository.countByUserId.mockResolvedValue(2);
    mocks.vehicleRepository.create.mockResolvedValue(inactiveVehicle);

    const result = await vehicleService.createVehicle('user-1', {
      name: 'Night Fury',
      brand: 'Nissan',
      model: 'Skyline R34',
      year: 1999,
      type: 'CAR',
      horsepower: 480,
    });

    expect(result).toEqual(inactiveVehicle);
    expect(mocks.vehicleRepository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'Night Fury',
      brand: 'Nissan',
      model: 'Skyline R34',
      year: 1999,
      type: 'CAR',
      horsepower: 480,
    });
  });

  it('lists all vehicles, my vehicles, and finds a vehicle by id', async () => {
    mocks.vehicleRepository.findAll.mockResolvedValue([inactiveVehicle]);
    mocks.vehicleRepository.findByUserId.mockResolvedValue([inactiveVehicle]);
    mocks.vehicleRepository.findById.mockResolvedValue(inactiveVehicle);

    await expect(vehicleService.getAllVehicles()).resolves.toEqual([inactiveVehicle]);
    await expect(vehicleService.getMyVehicles('user-1')).resolves.toEqual([inactiveVehicle]);
    await expect(vehicleService.getVehicleById('vehicle-1')).resolves.toEqual(inactiveVehicle);
  });

  it('rejects fetching an unknown vehicle', async () => {
    mocks.vehicleRepository.findById.mockResolvedValue(null);

    await expect(vehicleService.getVehicleById('missing-vehicle')).rejects.toThrow(
      'Vehicle not found',
    );
  });

  it('rejects creating more than three vehicles', async () => {
    mocks.vehicleRepository.countByUserId.mockResolvedValue(3);

    await expect(
      vehicleService.createVehicle('user-1', {
        name: 'Extra Car',
        brand: 'Toyota',
        model: 'Supra',
        year: 1998,
        type: 'CAR',
        horsepower: 450,
      }),
    ).rejects.toThrow(AppError);
  });

  it('activates an owned inactive vehicle and deactivates the rest', async () => {
    const activeVehicle = { ...inactiveVehicle, isActive: true };
    mocks.vehicleRepository.findById.mockResolvedValue(inactiveVehicle);
    mocks.vehicleRepository.deactivateAllByUserId.mockResolvedValue({ count: 1 });
    mocks.vehicleRepository.activate.mockResolvedValue(activeVehicle);

    const result = await vehicleService.activateVehicle('user-1', 'vehicle-1');

    expect(result).toEqual(activeVehicle);
    expect(mocks.vehicleRepository.deactivateAllByUserId).toHaveBeenCalledWith('user-1');
    expect(mocks.vehicleRepository.activate).toHaveBeenCalledWith('vehicle-1');
  });

  it('rejects activating another user vehicle', async () => {
    mocks.vehicleRepository.findById.mockResolvedValue({
      ...inactiveVehicle,
      userId: 'other-user',
    });

    await expect(vehicleService.activateVehicle('user-1', 'vehicle-1')).rejects.toThrow(
      'You can only activate your own vehicles',
    );
  });

  it('rejects activating an already active vehicle', async () => {
    mocks.vehicleRepository.findById.mockResolvedValue({
      ...inactiveVehicle,
      isActive: true,
    });

    await expect(vehicleService.activateVehicle('user-1', 'vehicle-1')).rejects.toThrow(
      'Vehicle is already active',
    );
  });

  it('updates and deletes only owned vehicles', async () => {
    mocks.vehicleRepository.findById.mockResolvedValue(inactiveVehicle);
    mocks.vehicleRepository.update.mockResolvedValue({ ...inactiveVehicle, horsepower: 520 });
    mocks.vehicleRepository.delete.mockResolvedValue(inactiveVehicle);

    await expect(
      vehicleService.updateVehicle('user-1', 'vehicle-1', { horsepower: 520 }),
    ).resolves.toMatchObject({ horsepower: 520 });
    await expect(vehicleService.deleteVehicle('user-1', 'vehicle-1')).resolves.toEqual(
      inactiveVehicle,
    );
  });

  it('rejects updating and deleting unknown vehicles', async () => {
    mocks.vehicleRepository.findById.mockResolvedValue(null);

    await expect(
      vehicleService.updateVehicle('user-1', 'missing-vehicle', { horsepower: 520 }),
    ).rejects.toThrow('Vehicle not found');
    await expect(vehicleService.deleteVehicle('user-1', 'missing-vehicle')).rejects.toThrow(
      'Vehicle not found',
    );
  });

  it('rejects deleting another user vehicle', async () => {
    mocks.vehicleRepository.findById.mockResolvedValue({
      ...inactiveVehicle,
      userId: 'other-user',
    });

    await expect(vehicleService.deleteVehicle('user-1', 'vehicle-1')).rejects.toThrow(
      'You can only delete your own vehicles',
    );
  });
});
