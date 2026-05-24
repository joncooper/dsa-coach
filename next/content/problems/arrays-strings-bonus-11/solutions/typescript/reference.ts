export function longestMountain(nums: number[]): number {
  let best = 0;
  let index = 1;
  while (index < nums.length - 1) {
    const isPeak = nums[index - 1] < nums[index] && nums[index] > nums[index + 1];
    if (!isPeak) {
      index += 1;
      continue;
    }
    let left = index - 1;
    while (left > 0 && nums[left - 1] < nums[left]) left -= 1;
    let right = index + 1;
    while (right < nums.length - 1 && nums[right] > nums[right + 1]) right += 1;
    best = Math.max(best, right - left + 1);
    index = right + 1;
  }
  return best;
}
