export function maxScoreAfterHalving(nums: number[], k: number): number {
  const values = [...nums];
  for (let count = 0; count < k; count += 1) {
    values.sort((a, b) => b - a);
    if (values.length === 0 || values[0] <= 1) break;
    values[0] = Math.ceil(values[0] / 2);
  }
  return values.reduce((sum, value) => sum + value, 0);
}
