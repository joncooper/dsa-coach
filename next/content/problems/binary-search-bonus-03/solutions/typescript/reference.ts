export function countOccurrences(nums: number[], target: number): number {
  const lower = (value: number) => { let left = 0; let right = nums.length; while (left < right) { const mid = Math.floor((left + right) / 2); if (nums[mid] < value) left = mid + 1; else right = mid; } return left; };
  return lower(target + 1) - lower(target);
}
