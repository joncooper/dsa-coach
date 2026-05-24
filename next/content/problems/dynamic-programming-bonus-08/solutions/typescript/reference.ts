export function countChange(coins: number[], amount: number): number {
  const dp = new Array<number>(amount + 1).fill(0);
  dp[0] = 1;
  for (const coin of coins) for (let total = coin; total <= amount; total += 1) dp[total] += dp[total - coin];
  return dp[amount];
}
