import { ChallengeStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../utils/AppError';
import { challengeService } from './challenge.service';

const mocks = vi.hoisted(() => ({
  challengeRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    updateStatus: vi.fn(),
    complete: vi.fn(),
  },
  userRepository: {
    findById: vi.fn(),
    updateWinnerStats: vi.fn(),
    updateLoserStats: vi.fn(),
  },
  vehicleRepository: {
    findById: vi.fn(),
    findByUserId: vi.fn(),
  },
  notificationService: {
    createAndEmit: vi.fn(),
  },
}));

vi.mock('../repositories/challenge.repository', () => ({
  challengeRepository: mocks.challengeRepository,
}));

vi.mock('../repositories/user.repository', () => ({
  userRepository: mocks.userRepository,
}));

vi.mock('../repositories/vehicle.repository', () => ({
  vehicleRepository: mocks.vehicleRepository,
}));

vi.mock('./notification.service', () => ({
  notificationService: mocks.notificationService,
}));

const sender = {
  id: 'sender-1',
  name: 'Kevin Racer',
  rank: 'D',
  consecutiveWins: 0,
};

const receiver = {
  id: 'receiver-1',
  name: 'Rival Racer',
  rank: 'D',
  consecutiveWins: 0,
};

const senderVehicle = {
  id: 'sender-vehicle-1',
  userId: 'sender-1',
  type: 'CAR',
  isActive: true,
};

const receiverVehicle = {
  id: 'receiver-vehicle-1',
  userId: 'receiver-1',
  type: 'CAR',
  isActive: true,
};

const pendingChallenge = {
  id: 'challenge-1',
  senderId: 'sender-1',
  receiverId: 'receiver-1',
  status: ChallengeStatus.PENDING,
  sender,
  receiver,
};

describe('challengeService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates a challenge when business rules pass', async () => {
    const createdChallenge = { ...pendingChallenge, senderVehicle, receiverVehicle };
    mocks.userRepository.findById.mockResolvedValueOnce(sender).mockResolvedValueOnce(receiver);
    mocks.vehicleRepository.findById
      .mockResolvedValueOnce(senderVehicle)
      .mockResolvedValueOnce(receiverVehicle);
    mocks.vehicleRepository.findByUserId.mockResolvedValue([receiverVehicle]);
    mocks.challengeRepository.create.mockResolvedValue(createdChallenge);

    const result = await challengeService.createChallenge('sender-1', {
      receiverId: 'receiver-1',
      senderVehicleId: 'sender-vehicle-1',
      message: 'Race tonight',
    });

    expect(result).toEqual(createdChallenge);
    expect(mocks.notificationService.createAndEmit).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'receiver-1',
        type: 'CHALLENGE_RECEIVED',
        event: 'challenge:received',
      }),
    );
  });

  it('lists challenges for a user', async () => {
    mocks.challengeRepository.findByUserId.mockResolvedValue([pendingChallenge]);

    await expect(challengeService.getMyChallenges('sender-1')).resolves.toEqual([
      pendingChallenge,
    ]);
  });

  it('rejects self challenges and rank mismatches', async () => {
    await expect(
      challengeService.createChallenge('sender-1', {
        receiverId: 'sender-1',
        senderVehicleId: 'sender-vehicle-1',
      }),
    ).rejects.toThrow('You cannot challenge yourself');

    mocks.userRepository.findById
      .mockResolvedValueOnce(sender)
      .mockResolvedValueOnce({ ...receiver, rank: 'C' });

    await expect(
      challengeService.createChallenge('sender-1', {
        receiverId: 'receiver-1',
        senderVehicleId: 'sender-vehicle-1',
      }),
    ).rejects.toThrow('You can only challenge racers with the same rank');
  });

  it('accepts only pending challenges by the receiver', async () => {
    const acceptedChallenge = { ...pendingChallenge, status: ChallengeStatus.ACCEPTED };
    mocks.challengeRepository.findById.mockResolvedValue(pendingChallenge);
    mocks.challengeRepository.updateStatus.mockResolvedValue(acceptedChallenge);

    await expect(challengeService.acceptChallenge('receiver-1', 'challenge-1')).resolves.toEqual(
      acceptedChallenge,
    );
    expect(mocks.challengeRepository.updateStatus).toHaveBeenCalledWith(
      'challenge-1',
      ChallengeStatus.ACCEPTED,
    );
  });

  it('rejects and cancels pending challenges with valid participants', async () => {
    const rejectedChallenge = { ...pendingChallenge, status: ChallengeStatus.REJECTED };
    const cancelledChallenge = { ...pendingChallenge, status: ChallengeStatus.CANCELLED };

    mocks.challengeRepository.findById
      .mockResolvedValueOnce(pendingChallenge)
      .mockResolvedValueOnce(pendingChallenge);
    mocks.challengeRepository.updateStatus
      .mockResolvedValueOnce(rejectedChallenge)
      .mockResolvedValueOnce(cancelledChallenge);

    await expect(challengeService.rejectChallenge('receiver-1', 'challenge-1')).resolves.toEqual(
      rejectedChallenge,
    );
    await expect(challengeService.cancelChallenge('sender-1', 'challenge-1')).resolves.toEqual(
      cancelledChallenge,
    );
  });

  it('rejects accepting, rejecting, and cancelling missing challenges', async () => {
    mocks.challengeRepository.findById.mockResolvedValue(null);

    await expect(challengeService.acceptChallenge('receiver-1', 'missing')).rejects.toThrow(
      'Challenge not found',
    );
    await expect(challengeService.rejectChallenge('receiver-1', 'missing')).rejects.toThrow(
      'Challenge not found',
    );
    await expect(challengeService.cancelChallenge('sender-1', 'missing')).rejects.toThrow(
      'Challenge not found',
    );
  });

  it('rejects status changes by non-participants', async () => {
    mocks.challengeRepository.findById.mockResolvedValue(pendingChallenge);

    await expect(challengeService.acceptChallenge('sender-1', 'challenge-1')).rejects.toThrow(
      'Only the receiver can accept this challenge',
    );
    await expect(challengeService.rejectChallenge('sender-1', 'challenge-1')).rejects.toThrow(
      'Only the receiver can reject this challenge',
    );
    await expect(challengeService.cancelChallenge('receiver-1', 'challenge-1')).rejects.toThrow(
      'Only the sender can cancel this challenge',
    );
  });

  it('rejects invalid challenge transitions through the state machine', async () => {
    mocks.challengeRepository.findById.mockResolvedValue({
      ...pendingChallenge,
      status: ChallengeStatus.COMPLETED,
    });

    await expect(challengeService.acceptChallenge('receiver-1', 'challenge-1')).rejects.toThrow(
      AppError,
    );
  });

  it('completes a challenge, updates stats, and upgrades rank after two wins', async () => {
    const acceptedChallenge = {
      ...pendingChallenge,
      status: ChallengeStatus.ACCEPTED,
    };
    const winner = { ...sender, consecutiveWins: 1 };
    const loser = { ...receiver, consecutiveWins: 1 };
    const completedChallenge = {
      ...acceptedChallenge,
      status: ChallengeStatus.COMPLETED,
      winnerId: 'sender-1',
    };

    mocks.challengeRepository.findById.mockResolvedValue(acceptedChallenge);
    mocks.userRepository.findById.mockResolvedValueOnce(winner).mockResolvedValueOnce(loser);
    mocks.userRepository.updateWinnerStats.mockResolvedValue(undefined);
    mocks.userRepository.updateLoserStats.mockResolvedValue(undefined);
    mocks.challengeRepository.complete.mockResolvedValue(completedChallenge);

    const result = await challengeService.completeChallenge('sender-1', 'challenge-1', {
      winnerId: 'sender-1',
    });

    expect(result).toMatchObject({
      challenge: completedChallenge,
      rankUpgraded: true,
      previousRank: 'D',
      currentRank: 'C',
    });
    expect(mocks.userRepository.updateWinnerStats).toHaveBeenCalledWith('sender-1', {
      rank: 'C',
      consecutiveWins: 0,
    });
    expect(mocks.userRepository.updateLoserStats).toHaveBeenCalledWith('receiver-1', 0);
  });

  it('completes without upgrading rank after one win', async () => {
    const acceptedChallenge = {
      ...pendingChallenge,
      status: ChallengeStatus.ACCEPTED,
    };
    const winner = { ...sender, consecutiveWins: 0 };
    const loser = { ...receiver, consecutiveWins: 0 };
    const completedChallenge = {
      ...acceptedChallenge,
      status: ChallengeStatus.COMPLETED,
      winnerId: 'sender-1',
    };

    mocks.challengeRepository.findById.mockResolvedValue(acceptedChallenge);
    mocks.userRepository.findById.mockResolvedValueOnce(winner).mockResolvedValueOnce(loser);
    mocks.challengeRepository.complete.mockResolvedValue(completedChallenge);

    const result = await challengeService.completeChallenge('sender-1', 'challenge-1', {
      winnerId: 'sender-1',
    });

    expect(result).toMatchObject({
      rankUpgraded: false,
      previousRank: 'D',
      currentRank: 'D',
    });
    expect(mocks.userRepository.updateWinnerStats).toHaveBeenCalledWith('sender-1', {
      rank: 'D',
      consecutiveWins: 1,
    });
  });

  it('rejects invalid completion attempts', async () => {
    mocks.challengeRepository.findById.mockResolvedValueOnce(null);

    await expect(
      challengeService.completeChallenge('sender-1', 'missing', { winnerId: 'sender-1' }),
    ).rejects.toThrow('Challenge not found');

    mocks.challengeRepository.findById.mockResolvedValueOnce({
      ...pendingChallenge,
      status: ChallengeStatus.ACCEPTED,
    });

    await expect(
      challengeService.completeChallenge('stranger', 'challenge-1', { winnerId: 'sender-1' }),
    ).rejects.toThrow('Only challenge participants can complete this challenge');

    mocks.challengeRepository.findById.mockResolvedValueOnce({
      ...pendingChallenge,
      status: ChallengeStatus.ACCEPTED,
    });

    await expect(
      challengeService.completeChallenge('sender-1', 'challenge-1', { winnerId: 'stranger' }),
    ).rejects.toThrow('Winner must be one of the challenge participants');
  });
});
