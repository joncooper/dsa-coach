export function twoSumExists(nums: number[], target: number): boolean {
  const seen = new Set<number>();
  for (const num of nums) {
    if (seen.has(target - num)) return true;
    seen.add(num);
  }
  return false;
}
