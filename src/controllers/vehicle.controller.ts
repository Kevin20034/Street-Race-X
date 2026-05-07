import { RequestHandler } from 'express';
import { AuthenticatedRequest } from '../models/auth.types';
import { CreateVehicleInput, UpdateVehicleInput } from '../models/vehicle.schemas';
import { vehicleService } from '../services/vehicle.service';
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

export const vehicleController = {
  getAll: (async (_req, res, next) => {
    try {
      const vehicles = await vehicleService.getAllVehicles();

      return sendSuccess(res, vehicles, 'Vehicles retrieved successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  create: (async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = getAuthenticatedUserId(req);

      const vehicle = await vehicleService.createVehicle(userId, req.body as CreateVehicleInput);

      return sendSuccess(res, vehicle, 'Vehicle created successfully', 201);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getMine: (async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = getAuthenticatedUserId(req);

      const vehicles = await vehicleService.getMyVehicles(userId);

      return sendSuccess(res, vehicles, 'Vehicles retrieved successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getById: (async (req, res, next) => {
    try {
      const vehicle = await vehicleService.getVehicleById(req.params.id);

      return sendSuccess(res, vehicle, 'Vehicle retrieved successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler<IdParams>,

  update: (async (req: AuthenticatedIdRequest, res, next) => {
    try {
      const userId = getAuthenticatedUserId(req);

      const vehicle = await vehicleService.updateVehicle(
        userId,
        req.params.id,
        req.body as UpdateVehicleInput,
      );

      return sendSuccess(res, vehicle, 'Vehicle updated successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler<IdParams>,

  delete: (async (req: AuthenticatedIdRequest, res, next) => {
    try {
      const userId = getAuthenticatedUserId(req);

      const vehicle = await vehicleService.deleteVehicle(userId, req.params.id);

      return sendSuccess(res, vehicle, 'Vehicle deleted successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler<IdParams>,

  activate: (async (req: AuthenticatedIdRequest, res, next) => {
    try {
      const userId = getAuthenticatedUserId(req);

      const vehicle = await vehicleService.activateVehicle(userId, req.params.id);

      return sendSuccess(res, vehicle, 'Vehicle activated successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler<IdParams>,
};
