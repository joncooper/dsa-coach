export function subsetSumReachable(nums: number[], target: number): boolean {
  const reachable = new Array<boolean>(target + 1).fill(false);
  reachable[0] = true;
  for (const num of nums) {
    for (let total = target; total >= num; total -= 1) reachable[total] = reachable[total] || reachable[total - num];
  }
  return reachable[target] ?? false;
}
