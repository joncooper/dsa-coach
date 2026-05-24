export function twoSumSorted(nums: number[], target: number): number[] {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const total = nums[left] + nums[right];
    if (total === target) return [left, right];
    if (total < target) left += 1;
    else right -= 1;
  }
  return [-1, -1];
}
