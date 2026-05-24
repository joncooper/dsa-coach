export function minArrows(intervals: number[][]): number {
  if (intervals.length === 0) return 0;
  const sorted = [...intervals].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  let arrows = 0;
  let arrow = -Infinity;
  for (const [start, end] of sorted) {
    if (start > arrow) {
      arrows += 1;
      arrow = end;
    }
  }
  return arrows;
}
