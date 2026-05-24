export function maxWaterArea(heights: number[]): number {
  let left = 0;
  let right = heights.length - 1;
  let best = 0;
  while (left < right) {
    best = Math.max(best, Math.min(heights[left], heights[right]) * (right - left));
    if (heights[left] < heights[right]) left += 1;
    else right -= 1;
  }
  return best;
}
