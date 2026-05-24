export function firstNegativeIndex(nums: number[]): number {
  for (let index = 0; index < nums.length; index += 1) {
    if (nums[index] < 0) return index;
  }
  return -1;
}
