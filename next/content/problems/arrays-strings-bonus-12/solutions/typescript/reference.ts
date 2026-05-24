export function maxSubarraySum(nums: number[]): number {
  let best = nums[0];
  let current = nums[0];
  for (let index = 1; index < nums.length; index += 1) {
    current = Math.max(nums[index], current + nums[index]);
    best = Math.max(best, current);
  }
  return best;
}
