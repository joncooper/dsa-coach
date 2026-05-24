export function climbWithBlocks(n: number, blocks: number[]): number {
  const dp = new Array<number>(n + 1).fill(0);
  dp[0] = 1;
  for (let stair = 1; stair <= n; stair += 1) {
    for (const block of blocks) if (stair >= block) dp[stair] += dp[stair - block];
  }
  return dp[n];
}
