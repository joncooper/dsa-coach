export function countTargetSumSubarrays(nums: number[], target: number): number {
  const counts = new Map<number, number>([[0, 1]]);
  let prefix = 0;
  let total = 0;
  for (const num of nums) {
    prefix += num;
    total += counts.get(prefix - target) ?? 0;
    counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
  }
  return total;
}
