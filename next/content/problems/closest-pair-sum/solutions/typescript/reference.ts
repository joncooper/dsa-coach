export function closestPairSum(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;
  let best = nums[0] + nums[1];
  while (left < right) {
    const total = nums[left] + nums[right];
    const better = Math.abs(total - target) < Math.abs(best - target);
    const tiedSmaller = Math.abs(total - target) === Math.abs(best - target) && total < best;
    if (better || tiedSmaller) best = total;
    if (total < target) left += 1;
    else if (total > target) right -= 1;
    else return total;
  }
  return best;
}
