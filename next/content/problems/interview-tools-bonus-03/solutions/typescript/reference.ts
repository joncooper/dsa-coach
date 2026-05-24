export function longestTwoValueRun(nums: number[]): number {
  const counts = new Map<number, number>();
  let left = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right += 1) {
    counts.set(nums[right], (counts.get(nums[right]) ?? 0) + 1);
    while (counts.size > 2) {
      const value = nums[left];
      const next = (counts.get(value) ?? 0) - 1;
      if (next === 0) counts.delete(value);
      else counts.set(value, next);
      left += 1;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
