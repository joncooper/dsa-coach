export function coveredServiceTime(windows: number[][]): number {
  if (windows.length === 0) {
    return 0;
  }

  const ordered = windows
    .map(([start, end]) => [start, end])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let [currentStart, currentEnd] = ordered[0];
  let total = 0;

  for (const [start, end] of ordered.slice(1)) {
    if (start > currentEnd) {
      total += currentEnd - currentStart;
      [currentStart, currentEnd] = [start, end];
    } else {
      currentEnd = Math.max(currentEnd, end);
    }
  }

  return total + currentEnd - currentStart;
}
