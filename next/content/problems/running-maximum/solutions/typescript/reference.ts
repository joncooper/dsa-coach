export function runningMaximum(nums: number[]): number[] {
  const out: number[] = [];
  let best = Number.NEGATIVE_INFINITY;
  for (const value of nums) {
    best = Math.max(best, value);
    out.push(best);
  }
  return out;
}
