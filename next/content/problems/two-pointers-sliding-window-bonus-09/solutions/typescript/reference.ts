export function dedupeSortedLength(nums: number[]): number {
  if (nums.length === 0) return 0;
  let write = 1;
  for (let read = 1; read < nums.length; read += 1) {
    if (nums[read] !== nums[write - 1]) {
      nums[write] = nums[read];
      write += 1;
    }
  }
  return write;
}
