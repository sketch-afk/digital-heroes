export type DrawMode = 'random' | 'algorithmic';

export interface ScoreFrequency {
  score: number;
  count: number;
}

export interface DrawConfig {
  min: number;
  max: number;
  count: number;
}

/**
 * Returns a set of unique numbers.
 */
export function generateRandomDraw(config: DrawConfig = { min: 1, max: 45, count: 5 }): number[] {
  const result = new Set<number>();
  while (result.size < config.count) {
    const r = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    result.add(r);
  }
  return Array.from(result).sort((a, b) => a - b);
}

/**
 * Generates numbers weighted by the frequency of user scores.
 * Scores with higher frequencies are more likely to be picked.
 */
export function generateAlgorithmicDraw(
  frequencies: ScoreFrequency[], 
  config: DrawConfig = { min: 1, max: 45, count: 5 }
): number[] {
  // If we don't have enough data, fallback to random
  if (!frequencies || frequencies.length < config.count) {
    return generateRandomDraw(config);
  }

  const result = new Set<number>();
  
  // Clone and sort frequencies highest to lowest
  const pool = [...frequencies].sort((a, b) => b.count - a.count);

  let totalWeight = pool.reduce((sum, item) => sum + item.count, 0);

  while (result.size < config.count && pool.length > 0) {
    const r = Math.floor(Math.random() * totalWeight);
    let cumulative = 0;
    
    for (let i = 0; i < pool.length; i++) {
      cumulative += pool[i].count;
      if (r < cumulative) {
        result.add(pool[i].score);
        // Remove picked item from pool so we don't pick it again
        totalWeight -= pool[i].count;
        pool.splice(i, 1);
        break;
      }
    }
  }

  // If for some reason we couldn't get enough unique numbers, fill with random ones
  while (result.size < config.count) {
    const r = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    result.add(r);
  }

  return Array.from(result).sort((a, b) => a - b);
}

/**
 * Calculates how many matches a user's entry has against the winning numbers.
 * The entry is an array of 5 scores.
 * The winning numbers is an array of 5 numbers.
 */
export function calculateMatches(userScores: number[], winningNumbers: number[]): number {
  // We only count distinct score values that appear in the winning numbers.
  // Example: user has [10, 10, 15, 20, 20], winning: [10, 20, 30, 40, 45].
  // Distinct user scores: 10, 15, 20.
  // Intersection with winning: 10, 20 -> 2 matches.
  
  const distinctUserScores = new Set(userScores);
  const winningSet = new Set(winningNumbers);
  
  let matchCount = 0;
  distinctUserScores.forEach(score => {
    if (winningSet.has(score)) {
      matchCount++;
    }
  });

  return matchCount;
}
