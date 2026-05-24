export function maxSumAfterFlips(nums: number[], k: number): number {
  const values = [...nums].sort((a, b) => a - b);
  let remaining = k;
  for (let index = 0; index < values.length && remaining > 0 && values[index] < 0; index += 1) {
    values[index] = -values[index];
    remaining -= 1;
  }
  let total = values.reduce((sum, value) => sum + value, 0);
  const smallestAbs = Math.min(...values.map((value) => Math.abs(value)));
  if (remaining % 2 === 1) total -= 2 * smallestAbs;
  return total;
}
