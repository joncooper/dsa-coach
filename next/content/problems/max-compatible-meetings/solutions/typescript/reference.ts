export function maxCompatibleMeetings(intervals: number[][]): number {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  let count = 0;
  let currentEnd = -Infinity;
  for (const [start, end] of sorted) {
    if (start >= currentEnd) {
      count += 1;
      currentEnd = end;
    }
  }
  return count;
}
