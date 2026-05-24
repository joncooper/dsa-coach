export function runningRangeWidth(nums: number[]): number[] {
  const result: number[] = [];
  let low: number | null = null;
  let high: number | null = null;
  for (const num of nums) {
    low = low === null ? num : Math.min(low, num);
    high = high === null ? num : Math.max(high, num);
    result.push(high - low);
  }
  return result;
}
