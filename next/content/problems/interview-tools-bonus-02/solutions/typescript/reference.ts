export function unpairedNumber(nums: number[]): number {
  const unmatched = new Set<number>();
  for (const value of nums) {
    if (unmatched.has(value)) unmatched.delete(value);
    else unmatched.add(value);
  }
  return unmatched.values().next().value ?? 0;
}
