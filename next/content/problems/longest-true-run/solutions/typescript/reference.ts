export function longestTrueRun(flags: boolean[]): number {
  let best = 0;
  let current = 0;
  for (const flag of flags) {
    if (flag) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}
