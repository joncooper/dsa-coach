export function isSortedAscending(nums: number[]): boolean {
  for (let index = 1; index < nums.length; index += 1) {
    if (nums[index] < nums[index - 1]) return false;
  }
  return true;
}
