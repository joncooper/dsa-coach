export function countBoats(weights: number[], limit: number): number {
  const sorted = [...weights].sort((a, b) => a - b);
  let left = 0;
  let right = sorted.length - 1;
  let boats = 0;
  while (left <= right) {
    if (sorted[left] + sorted[right] <= limit) left += 1;
    right -= 1;
    boats += 1;
  }
  return boats;
}
