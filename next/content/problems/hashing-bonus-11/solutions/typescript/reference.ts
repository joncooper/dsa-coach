export function countDistinctPairSums(nums: number[]): number {
  const sums = new Set<number>();
  for (let left = 0; left < nums.length; left += 1) {
    for (let right = left + 1; right < nums.length; right += 1) {
      sums.add(nums[left] + nums[right]);
    }
  }
  return sums.size;
}
