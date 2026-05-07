import { Rank } from '@prisma/client';

const rankOrder: Rank[] = ['D', 'C', 'B', 'A', 'S'];

export const getNextRank = (currentRank: Rank): Rank => {
  const currentIndex = rankOrder.indexOf(currentRank);

  if (currentIndex === -1 || currentIndex === rankOrder.length - 1) {
    return currentRank;
  }

  return rankOrder[currentIndex + 1];
};

export const shouldUpgradeRank = (consecutiveWins: number): boolean => {
  return consecutiveWins >= 2;
};
