import { RequestHandler } from 'express';
import { AuthenticatedRequest } from '../models/auth.types';
import { CompleteChallengeInput, CreateChallengeInput } from '../models/challenge.schemas';
import { challengeService } from '../services/challenge.service';
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

export const challengeController = {
  create: (async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = getAuthenticatedUserId(req);

      const challenge = await challengeService.createChallenge(
        userId,
        req.body as CreateChallengeInput,
      );

      return sendSuccess(res, challenge, 'Challenge created successfully', 201);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  getMine: (async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = getAuthenticatedUserId(req);

      const challenges = await challengeService.getMyChallenges(userId);

      return sendSuccess(res, challenges, 'Challenges retrieved successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,

  accept: (async (req: AuthenticatedIdRequest, res, next) => {
    try {
      const userId = getAuthenticatedUserId(req);

      const challenge = await challengeService.acceptChallenge(userId, req.params.id);

      return sendSuccess(res, challenge, 'Challenge accepted successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler<IdParams>,

  reject: (async (req: AuthenticatedIdRequest, res, next) => {
    try {
      const userId = getAuthenticatedUserId(req);

      const challenge = await challengeService.rejectChallenge(userId, req.params.id);

      return sendSuccess(res, challenge, 'Challenge rejected successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler<IdParams>,

  cancel: (async (req: AuthenticatedIdRequest, res, next) => {
    try {
      const userId = getAuthenticatedUserId(req);

      const challenge = await challengeService.cancelChallenge(userId, req.params.id);

      return sendSuccess(res, challenge, 'Challenge cancelled successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler<IdParams>,

  complete: (async (req: AuthenticatedIdRequest, res, next) => {
    try {
      const userId = getAuthenticatedUserId(req);

      const result = await challengeService.completeChallenge(
        userId,
        req.params.id,
        req.body as CompleteChallengeInput,
      );

      return sendSuccess(res, result, 'Challenge completed successfully');
    } catch (error) {
      next(error);
    }
  }) as RequestHandler<IdParams>,
};
