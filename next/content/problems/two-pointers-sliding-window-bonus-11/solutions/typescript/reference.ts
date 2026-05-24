export function longestWithinLimit(nums: number[], limit: number): number {
  let left = 0;
  let total = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right += 1) {
    total += nums[right];
    while (total > limit && left <= right) {
      total -= nums[left];
      left += 1;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
