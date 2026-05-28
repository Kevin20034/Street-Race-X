import { ChallengeStatus } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { AppError } from './AppError';
import { assertChallengeTransition, isFinalChallengeStatus } from './challengeStateMachine';

describe('challengeStateMachine', () => {
  it('allows valid challenge transitions', () => {
    expect(() =>
      assertChallengeTransition(ChallengeStatus.PENDING, ChallengeStatus.ACCEPTED),
    ).not.toThrow();
    expect(() =>
      assertChallengeTransition(ChallengeStatus.PENDING, ChallengeStatus.REJECTED),
    ).not.toThrow();
    expect(() =>
      assertChallengeTransition(ChallengeStatus.PENDING, ChallengeStatus.CANCELLED),
    ).not.toThrow();
    expect(() =>
      assertChallengeTransition(ChallengeStatus.ACCEPTED, ChallengeStatus.COMPLETED),
    ).not.toThrow();
  });

  it('rejects invalid challenge transitions', () => {
    expect(() =>
      assertChallengeTransition(ChallengeStatus.REJECTED, ChallengeStatus.COMPLETED),
    ).toThrow(AppError);
    expect(() =>
      assertChallengeTransition(ChallengeStatus.COMPLETED, ChallengeStatus.ACCEPTED),
    ).toThrow('Challenge cannot transition from COMPLETED to ACCEPTED');
  });

  it('detects final statuses', () => {
    expect(isFinalChallengeStatus(ChallengeStatus.PENDING)).toBe(false);
    expect(isFinalChallengeStatus(ChallengeStatus.ACCEPTED)).toBe(false);
    expect(isFinalChallengeStatus(ChallengeStatus.REJECTED)).toBe(true);
    expect(isFinalChallengeStatus(ChallengeStatus.CANCELLED)).toBe(true);
    expect(isFinalChallengeStatus(ChallengeStatus.COMPLETED)).toBe(true);
  });
});
