export function canPartitionKSubsets(nums: number[], k: number): boolean {
  const total = nums.reduce((sum, num) => sum + num, 0);
  if (k <= 0 || total % k !== 0) return false;
  const target = total / k;
  const ordered = [...nums].sort((a, b) => b - a);
  if (ordered.length > 0 && ordered[0] > target) return false;
  const buckets = new Array<number>(k).fill(0);
  const backtrack = (index: number): boolean => {
    if (index === ordered.length) return true;
    const seen = new Set<number>();
    for (let bucket = 0; bucket < k; bucket += 1) {
      if (seen.has(buckets[bucket])) continue;
      if (buckets[bucket] + ordered[index] <= target) {
        seen.add(buckets[bucket]);
        buckets[bucket] += ordered[index];
        if (backtrack(index + 1)) return true;
        buckets[bucket] -= ordered[index];
      }
      if (buckets[bucket] === 0) break;
    }
    return false;
  };
  return backtrack(0);
}
