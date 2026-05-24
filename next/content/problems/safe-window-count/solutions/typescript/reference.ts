export function countSafeWindows(nums: number[], k: number, limit: number): number {
  if (k <= 0 || k > nums.length) return 0;
  let windowSum = 0;
  for (let index = 0; index < k; index += 1) windowSum += nums[index];
  let count = windowSum <= limit ? 1 : 0;
  for (let right = k; right < nums.length; right += 1) {
    windowSum += nums[right] - nums[right - k];
    if (windowSum <= limit) count += 1;
  }
  return count;
}
