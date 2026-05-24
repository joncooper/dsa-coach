export function knapsackMaxValue(weights: number[], values: number[], capacity: number): number {
  const dp = new Array<number>(capacity + 1).fill(0);
  for (let index = 0; index < weights.length; index += 1) {
    const weight = weights[index];
    const value = values[index];
    for (let cap = capacity; cap >= weight; cap -= 1) dp[cap] = Math.max(dp[cap], dp[cap - weight] + value);
  }
  return dp[capacity];
}
