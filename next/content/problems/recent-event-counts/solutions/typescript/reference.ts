export function recentEventCounts(timestamps: number[], window: number): number[] {
  let left = 0;
  const counts: number[] = [];
  for (let right = 0; right < timestamps.length; right += 1) {
    const timestamp = timestamps[right];
    while (timestamps[left] < timestamp - window) left += 1;
    counts.push(right - left + 1);
  }
  return counts;
}
