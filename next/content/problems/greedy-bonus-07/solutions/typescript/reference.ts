export function minRooms(intervals: number[][]): number {
  const starts = intervals.map((interval) => interval[0]).sort((a, b) => a - b);
  const ends = intervals.map((interval) => interval[1]).sort((a, b) => a - b);
  let endIndex = 0;
  let active = 0;
  let best = 0;
  for (const start of starts) {
    while (endIndex < ends.length && ends[endIndex] <= start) { active -= 1; endIndex += 1; }
    active += 1;
    best = Math.max(best, active);
  }
  return best;
}
