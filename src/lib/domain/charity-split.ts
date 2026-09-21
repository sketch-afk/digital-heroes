export interface PaymentSplitConfig {
  grossAmount: number; // integer (smallest currency unit, e.g., paise)
  charityPercent: number; // integer (10 to 100)
  prizePoolPercent: number; // integer (e.g., 50)
}

export interface PaymentSplitResult {
  charityAmount: number;
  prizePoolAmount: number;
  platformAmount: number;
}

/**
 * Calculates the split of a subscription payment based on the user's chosen charity percent
 * and the platform's configured prize pool percent.
 */
export function calculatePaymentSplit(config: PaymentSplitConfig): PaymentSplitResult {
  if (config.charityPercent < 10 || config.charityPercent > 100) {
    throw new Error('Charity percent must be between 10 and 100');
  }
  
  if (config.prizePoolPercent < 0 || config.prizePoolPercent > 100) {
    throw new Error('Prize pool percent must be between 0 and 100');
  }

  if (config.charityPercent + config.prizePoolPercent > 100) {
    throw new Error('Charity percent and prize pool percent combined cannot exceed 100');
  }

  // Floor division to keep as integers
  const charityAmount = Math.floor((config.grossAmount * config.charityPercent) / 100);
  const prizePoolAmount = Math.floor((config.grossAmount * config.prizePoolPercent) / 100);
  
  // The rest goes to the platform
  const platformAmount = config.grossAmount - charityAmount - prizePoolAmount;

  return {
    charityAmount,
    prizePoolAmount,
    platformAmount
  };
}
