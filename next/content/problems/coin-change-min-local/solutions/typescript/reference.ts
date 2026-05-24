export function coinChangeMinLocal(coins: number[], amount: number): number {
  const impossible = amount + 1;
  const dp = new Array<number>(amount + 1).fill(impossible);
  dp[0] = 0;
  for (let total = 1; total <= amount; total += 1) { for (const coin of coins) if (total >= coin) dp[total] = Math.min(dp[total], dp[total - coin] + 1); }
  return dp[amount] === impossible ? -1 : dp[amount];
}
