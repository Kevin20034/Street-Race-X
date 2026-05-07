import { CompleteChallengeInput, CreateChallengeInput } from '../models/challenge.schemas';
import { challengeRepository } from '../repositories/challenge.repository';
import { userRepository } from '../repositories/user.repository';
import { vehicleRepository } from '../repositories/vehicle.repository';
import { AppError } from '../utils/AppError';
import { getNextRank, shouldUpgradeRank } from '../utils/rank';
import { notificationService } from './notification.service';

export const challengeService = {
  async createChallenge(senderId: string, input: CreateChallengeInput) {
    if (senderId === input.receiverId) {
      throw new AppError('You cannot challenge yourself', 400);
    }

    const sender = await userRepository.findById(senderId);
    const receiver = await userRepository.findById(input.receiverId);

    if (!sender || !receiver) {
      throw new AppError('Sender or receiver not found', 404);
    }

    if (sender.rank !== receiver.rank) {
      throw new AppError('You can only challenge racers with the same rank', 400);
    }

    const senderVehicle = await vehicleRepository.findById(input.senderVehicleId);

    if (!senderVehicle) {
      throw new AppError('Sender vehicle not found', 404);
    }

    if (senderVehicle.userId !== senderId) {
      throw new AppError('You can only use your own vehicle', 403);
    }

    let receiverVehicleId = input.receiverVehicleId;

    if (!receiverVehicleId) {
      const receiverVehicles = await vehicleRepository.findByUserId(input.receiverId);
      const activeVehicle = receiverVehicles.find((vehicle) => vehicle.isActive);

      if (!activeVehicle) {
        throw new AppError('Receiver does not have an active vehicle', 400);
      }

      receiverVehicleId = activeVehicle.id;
    }

    const receiverVehicle = await vehicleRepository.findById(receiverVehicleId);

    if (!receiverVehicle) {
      throw new AppError('Receiver vehicle not found', 404);
    }

    if (receiverVehicle.userId !== input.receiverId) {
      throw new AppError('Receiver vehicle does not belong to receiver', 400);
    }

    if (senderVehicle.type !== receiverVehicle.type) {
      throw new AppError('Both vehicles must be of the same type', 400);
    }

    const challenge = await challengeRepository.create({
      senderId,
      receiverId: input.receiverId,
      senderVehicleId: input.senderVehicleId,
      receiverVehicleId,
      categoryId: input.categoryId,
      message: input.message,
      location: input.location,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
    });

    await notificationService.createAndEmit({
      userId: input.receiverId,
      type: 'CHALLENGE_RECEIVED',
      title: 'New challenge received',
      message: `${sender.name} has challenged you to a race`,
      event: 'challenge:received',
      payload: challenge,
    });

    return challenge;
  },

  async getMyChallenges(userId: string) {
    return challengeRepository.findByUserId(userId);
  },

  async acceptChallenge(userId: string, id: string) {
    const challenge = await challengeRepository.findById(id);

    if (!challenge) {
      throw new AppError('Challenge not found', 404);
    }

    if (challenge.receiverId !== userId) {
      throw new AppError('Only the receiver can accept this challenge', 403);
    }

    if (challenge.status !== 'PENDING') {
      throw new AppError('Only pending challenges can be accepted', 400);
    }

    const updatedChallenge = await challengeRepository.updateStatus(id, 'ACCEPTED');

    await notificationService.createAndEmit({
      userId: challenge.senderId,
      type: 'CHALLENGE_ACCEPTED',
      title: 'Challenge accepted',
      message: `${updatedChallenge.receiver.name} accepted your challenge`,
      event: 'challenge:accepted',
      payload: updatedChallenge,
    });

    return updatedChallenge;
  },

  async rejectChallenge(userId: string, id: string) {
    const challenge = await challengeRepository.findById(id);

    if (!challenge) {
      throw new AppError('Challenge not found', 404);
    }

    if (challenge.receiverId !== userId) {
      throw new AppError('Only the receiver can reject this challenge', 403);
    }

    if (challenge.status !== 'PENDING') {
      throw new AppError('Only pending challenges can be rejected', 400);
    }

    const updatedChallenge = await challengeRepository.updateStatus(id, 'REJECTED');

    await notificationService.createAndEmit({
      userId: challenge.senderId,
      type: 'CHALLENGE_REJECTED',
      title: 'Challenge rejected',
      message: `${updatedChallenge.receiver.name} rejected your challenge`,
      event: 'challenge:rejected',
      payload: updatedChallenge,
    });

    return updatedChallenge;
  },

  async cancelChallenge(userId: string, id: string) {
    const challenge = await challengeRepository.findById(id);

    if (!challenge) {
      throw new AppError('Challenge not found', 404);
    }

    if (challenge.senderId !== userId) {
      throw new AppError('Only the sender can cancel this challenge', 403);
    }

    if (challenge.status !== 'PENDING') {
      throw new AppError('Only pending challenges can be cancelled', 400);
    }

    return challengeRepository.updateStatus(id, 'CANCELLED');
  },

  async completeChallenge(userId: string, id: string, input: CompleteChallengeInput) {
    const challenge = await challengeRepository.findById(id);

    if (!challenge) {
      throw new AppError('Challenge not found', 404);
    }

    if (challenge.senderId !== userId && challenge.receiverId !== userId) {
      throw new AppError('Only challenge participants can complete this challenge', 403);
    }

    if (challenge.status !== 'ACCEPTED') {
      throw new AppError('Only accepted challenges can be completed', 400);
    }

    if (input.winnerId !== challenge.senderId && input.winnerId !== challenge.receiverId) {
      throw new AppError('Winner must be one of the challenge participants', 400);
    }

    const loserId = input.winnerId === challenge.senderId ? challenge.receiverId : challenge.senderId;

    const winner = await userRepository.findById(input.winnerId);
    const loser = await userRepository.findById(loserId);

    if (!winner || !loser) {
      throw new AppError('Winner or loser not found', 404);
    }

    const nextConsecutiveWins = winner.consecutiveWins + 1;
    const upgraded = shouldUpgradeRank(nextConsecutiveWins);
    const nextRank = upgraded ? getNextRank(winner.rank) : winner.rank;
    const winnerConsecutiveWins = upgraded ? 0 : nextConsecutiveWins;
    const loserConsecutiveWins = Math.max(loser.consecutiveWins - 1, 0);

    await userRepository.updateWinnerStats(input.winnerId, {
      rank: nextRank,
      consecutiveWins: winnerConsecutiveWins,
    });

    await userRepository.updateLoserStats(loserId, loserConsecutiveWins);

    const completedChallenge = await challengeRepository.complete(id, input.winnerId);

    await notificationService.createAndEmit({
      userId: loserId,
      type: 'CHALLENGE_COMPLETED',
      title: 'Challenge completed',
      message: `${winner.name} won the challenge`,
      event: 'challenge:completed',
      payload: completedChallenge,
    });

    await notificationService.createAndEmit({
      userId: input.winnerId,
      type: 'CHALLENGE_COMPLETED',
      title: 'Challenge completed',
      message: 'You won the challenge',
      event: 'challenge:completed',
      payload: completedChallenge,
    });

    if (upgraded && nextRank !== winner.rank) {
      await notificationService.createAndEmit({
        userId: input.winnerId,
        type: 'RANK_UPGRADED',
        title: 'Rank upgraded',
        message: `You upgraded from ${winner.rank} to ${nextRank}`,
        event: 'rank:upgraded',
        payload: {
          previousRank: winner.rank,
          currentRank: nextRank,
        },
      });
    }

    return {
      challenge: completedChallenge,
      rankUpgraded: upgraded && nextRank !== winner.rank,
      previousRank: winner.rank,
      currentRank: nextRank,
    };
  },
};
