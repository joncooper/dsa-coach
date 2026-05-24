export function countEquilibriumIndices(nums: number[]): number {
  const total = nums.reduce((sum, num) => sum + num, 0);
  let left = 0;
  let count = 0;
  for (const num of nums) {
    if (left === total - left - num) count += 1;
    left += num;
  }
  return count;
}
