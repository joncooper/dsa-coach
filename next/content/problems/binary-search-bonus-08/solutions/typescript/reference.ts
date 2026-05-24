export function splitArrayMinLargest(nums: number[], k: number): number {
  const partsNeeded = (limit: number) => { let parts = 1; let total = 0; for (const num of nums) { if (total + num > limit) { parts += 1; total = 0; } total += num; } return parts; };
  let left = Math.max(...nums);
  let right = nums.reduce((sum, value) => sum + value, 0);
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (partsNeeded(mid) <= k) right = mid;
    else left = mid + 1;
  }
  return left;
}
