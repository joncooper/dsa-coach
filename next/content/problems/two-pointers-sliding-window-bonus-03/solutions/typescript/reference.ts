export function removeElement(nums: number[], value: number): number {
  let write = 0;
  for (const num of nums) {
    if (num !== value) {
      nums[write] = num;
      write += 1;
    }
  }
  return write;
}
