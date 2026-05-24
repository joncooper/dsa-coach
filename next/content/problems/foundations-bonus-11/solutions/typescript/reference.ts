export function pivotIndex(nums: number[]): number {
  const total = nums.reduce((sum, num) => sum + num, 0);
  let left = 0;
  for (let index = 0; index < nums.length; index += 1) {
    if (left === total - left - nums[index]) return index;
    left += nums[index];
  }
  return -1;
}
