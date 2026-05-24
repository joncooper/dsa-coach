export function runningMaximum(nums: number[]): number[] {
  const result: number[] = [];
  let best: number | undefined;
  for (const num of nums) {
    best = best === undefined ? num : Math.max(best, num);
    result.push(best);
  }
  return result;
}
