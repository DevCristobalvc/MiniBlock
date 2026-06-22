export type Currency = 'cUSD' | 'cCOP';

export const STAKE_OPTIONS: Record<Currency, number[]> = {
  cUSD: [0.10, 0.25, 0.50, 1.00],
  cCOP: [400, 1000, 2000, 5000],
};

export const PLATFORM_FEE = 0.05; // 5%

/**
 * Returns the payout for each rank (index 0 = rank 1).
 * Everyone stakes `stake`. Total distributable = n * stake * (1 - fee).
 * Top ~60% of players share the pool linearly (rank1 gets most, cutoff gets 0).
 * Players outside the paid zone get 0.
 *
 * Example (2 players, stake S):
 *   paidCount = 2, weights = [2,1], totalW = 3
 *   pool = 2S * 0.95 = 1.9S
 *   #1 = 1.9S * 2/3 ≈ 1.27S   (profit)
 *   #2 = 1.9S * 1/3 ≈ 0.63S   (partial recovery)
 */
export function calcPayouts(numPlayers: number, stake: number): number[] {
  if (numPlayers <= 0) return [];
  const pool = numPlayers * stake * (1 - PLATFORM_FEE);

  // At least 1 paid spot; cap at numPlayers; ~60% of field paid
  const paidCount = Math.max(1, Math.min(numPlayers, Math.ceil(numPlayers * 0.6)));

  // linear weights: paidCount, paidCount-1 ... 1  →  last paid gets 1 share
  const weights = Array.from({ length: paidCount }, (_, i) => paidCount - i);
  const totalW = weights.reduce((a, b) => a + b, 0);

  const payouts = Array(numPlayers).fill(0);
  weights.forEach((w, i) => { payouts[i] = (pool * w) / totalW; });
  return payouts;
}


export function formatAmount(amount: number, currency: Currency): string {
  if (currency === 'cCOP') return `$${Math.round(amount).toLocaleString()} COP`;
  return `${amount.toFixed(2)} cUSD`;
}
