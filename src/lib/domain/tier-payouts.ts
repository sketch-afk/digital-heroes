export interface TierConfig {
  match5SharePct: number; // 40
  match4SharePct: number; // 35
  match3SharePct: number; // 25
}

export interface DrawPoolState {
  totalPool: number; // newly added funds this month
  jackpotCarriedIn: number; // carried over from previous month
}

export interface TierWinnerCount {
  match5: number;
  match4: number;
  match3: number;
}

export interface TierPayoutResult {
  match5: {
    tierPool: number; // base share + carried in
    perWinnerAmount: number;
    rolledOverOut: number; // remainder or full amount if 0 winners
  };
  match4: {
    tierPool: number; // base share
    perWinnerAmount: number;
  };
  match3: {
    tierPool: number; // base share
    perWinnerAmount: number;
  };
}

/**
 * Calculates the prize payout for each tier given the total pool, carried over jackpot,
 * and number of winners in each tier.
 */
export function calculateTierPayouts(
  state: DrawPoolState,
  winners: TierWinnerCount,
  config: TierConfig = { match5SharePct: 40, match4SharePct: 35, match3SharePct: 25 }
): TierPayoutResult {
  
  if (config.match5SharePct + config.match4SharePct + config.match3SharePct !== 100) {
    throw new Error('Tier shares must add up to 100');
  }

  // Base tier pools
  const baseMatch5 = Math.floor((state.totalPool * config.match5SharePct) / 100);
  const baseMatch4 = Math.floor((state.totalPool * config.match4SharePct) / 100);
  const baseMatch3 = Math.floor((state.totalPool * config.match3SharePct) / 100);

  // Match 5 specific logic
  const tierPool5 = baseMatch5 + state.jackpotCarriedIn;
  let perWinner5 = 0;
  let rolledOverOut = tierPool5;

  if (winners.match5 > 0) {
    perWinner5 = Math.floor(tierPool5 / winners.match5);
    // Rollover the remainder that couldn't be split equally
    rolledOverOut = tierPool5 - (perWinner5 * winners.match5);
  }

  // Match 4 specific logic
  let perWinner4 = 0;
  if (winners.match4 > 0) {
    perWinner4 = Math.floor(baseMatch4 / winners.match4);
  }
  
  // Match 3 specific logic
  let perWinner3 = 0;
  if (winners.match3 > 0) {
    perWinner3 = Math.floor(baseMatch3 / winners.match3);
  }

  return {
    match5: {
      tierPool: tierPool5,
      perWinnerAmount: perWinner5,
      rolledOverOut
    },
    match4: {
      tierPool: baseMatch4,
      perWinnerAmount: perWinner4
    },
    match3: {
      tierPool: baseMatch3,
      perWinnerAmount: perWinner3
    }
  };
}
