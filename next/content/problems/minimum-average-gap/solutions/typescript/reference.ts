export function minimumAverageGapIndex(nums: number[]): number {
  const total = nums.reduce((sum, num) => sum + num, 0);
  let left = 0;
  let bestIndex = 0;
  let bestGap = Number.POSITIVE_INFINITY;
  for (let index = 0; index < nums.length; index += 1) {
    left += nums[index];
    const rightCount = nums.length - index - 1;
    const leftAverage = Math.floor(left / (index + 1));
    const rightAverage = rightCount === 0 ? 0 : Math.floor((total - left) / rightCount);
    const gap = Math.abs(leftAverage - rightAverage);
    if (gap < bestGap) {
      bestGap = gap;
      bestIndex = index;
    }
  }
  return bestIndex;
}
