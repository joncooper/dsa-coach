export function searchUnknownSize(nums: number[], target: number): number {
  if (nums.length === 0) return -1;
  let bound = 1;
  while (bound < nums.length && nums[bound] < target) bound *= 2;
  let left = Math.floor(bound / 2);
  let right = Math.min(bound, nums.length - 1);
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
