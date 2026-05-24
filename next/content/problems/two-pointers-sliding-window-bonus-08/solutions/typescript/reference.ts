export function countPairsBelow(nums: number[], threshold: number): number {
  const values = nums.slice().sort((left, right) => left - right);
  let left = 0;
  let right = values.length - 1;
  let count = 0;
  while (left < right) {
    if (values[left] + values[right] < threshold) {
      count += right - left;
      left += 1;
    } else {
      right -= 1;
    }
  }
  return count;
}
