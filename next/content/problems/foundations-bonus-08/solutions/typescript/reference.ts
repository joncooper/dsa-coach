export function sumEvenIndices(nums: number[]): number {
  let total = 0;
  for (let index = 0; index < nums.length; index += 2) {
    total += nums[index];
  }
  return total;
}
