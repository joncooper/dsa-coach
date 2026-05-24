export function missingNumber(nums: number[]): number {
  const seen = new Set(nums);
  for (let candidate = 0; candidate <= nums.length; candidate += 1) {
    if (!seen.has(candidate)) return candidate;
  }
  return nums.length;
}
