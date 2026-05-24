export function containsDuplicateWithinK(nums: number[], k: number): boolean {
  const lastSeen = new Map<number, number>();
  for (let index = 0; index < nums.length; index += 1) {
    const previous = lastSeen.get(nums[index]);
    if (previous !== undefined && index - previous <= k) return true;
    lastSeen.set(nums[index], index);
  }
  return false;
}
