import { ChallengeStatus } from '@prisma/client';
import { AppError } from './AppError';

const allowedTransitions: Record<ChallengeStatus, ChallengeStatus[]> = {
  PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['COMPLETED'],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
};

export const assertChallengeTransition = (
  currentStatus: ChallengeStatus,
  nextStatus: ChallengeStatus,
): void => {
  const allowedNextStatuses = allowedTransitions[currentStatus];

  if (!allowedNextStatuses.includes(nextStatus)) {
    throw new AppError(
      `Challenge cannot transition from ${currentStatus} to ${nextStatus}`,
      400,
    );
  }
};

export const isFinalChallengeStatus = (status: ChallengeStatus): boolean => {
  return allowedTransitions[status].length === 0;
};
