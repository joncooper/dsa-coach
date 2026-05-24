export function sortedSquaresLocal(nums: number[]): number[] {
  const result = new Array<number>(nums.length);
  let left = 0;
  let right = nums.length - 1;
  for (let write = nums.length - 1; write >= 0; write -= 1) {
    const leftSquare = nums[left] * nums[left];
    const rightSquare = nums[right] * nums[right];
    if (leftSquare > rightSquare) {
      result[write] = leftSquare;
      left += 1;
    } else {
      result[write] = rightSquare;
      right -= 1;
    }
  }
  return result;
}
