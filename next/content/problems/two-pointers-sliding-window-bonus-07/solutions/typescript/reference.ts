export function minWindowForSum(nums: number[], target: number): number {
  let left = 0;
  let total = 0;
  let best = Number.POSITIVE_INFINITY;
  for (let right = 0; right < nums.length; right += 1) {
    total += nums[right];
    while (total >= target) {
      best = Math.min(best, right - left + 1);
      total -= nums[left];
      left += 1;
    }
  }
  return Number.isFinite(best) ? best : 0;
}
