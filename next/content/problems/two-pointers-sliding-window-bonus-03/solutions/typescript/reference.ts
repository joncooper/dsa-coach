export function removeElement(nums: number[], value: number): number {
  let count = 0;
  for (const num of nums) {
    if (num !== value) count += 1;
  }
  return count;
}
