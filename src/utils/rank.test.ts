import { describe, expect, it } from 'vitest';
import { getNextRank, shouldUpgradeRank } from './rank';

describe('rank utils', () => {
  it('returns the next rank until S', () => {
    expect(getNextRank('D')).toBe('C');
    expect(getNextRank('C')).toBe('B');
    expect(getNextRank('B')).toBe('A');
    expect(getNextRank('A')).toBe('S');
    expect(getNextRank('S')).toBe('S');
  });

  it('upgrades with two or more consecutive wins', () => {
    expect(shouldUpgradeRank(0)).toBe(false);
    expect(shouldUpgradeRank(1)).toBe(false);
    expect(shouldUpgradeRank(2)).toBe(true);
    expect(shouldUpgradeRank(3)).toBe(true);
  });
});
