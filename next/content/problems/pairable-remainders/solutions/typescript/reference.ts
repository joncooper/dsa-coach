export function pairableRemainders(nums: number[], k: number): boolean {
  if (nums.length % 2 === 1) return false;
  const counts = new Map<number, number>();
  for (const num of nums) {
    const remainder = ((num % k) + k) % k;
    counts.set(remainder, (counts.get(remainder) ?? 0) + 1);
  }
  for (const [remainder, count] of counts) {
    const complement = (k - remainder) % k;
    if (remainder === complement) {
      if (count % 2 !== 0) return false;
    } else if (count !== (counts.get(complement) ?? 0)) {
      return false;
    }
  }
  return true;
}
