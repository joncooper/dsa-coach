export function editDistance(source: string, target: string): number {
  const dp = Array.from({ length: source.length + 1 }, () => new Array<number>(target.length + 1).fill(0));
  for (let i = 0; i <= source.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= target.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= source.length; i += 1) {
    for (let j = 1; j <= target.length; j += 1) {
      if (source[i - 1] === target[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[source.length][target.length];
}
