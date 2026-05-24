export function firstDayForBouquets(bloomDays: number[], bouquets: number, size: number): number {
  if (bouquets * size > bloomDays.length) return -1;
  const can = (day: number) => {
    let made = 0;
    let run = 0;
    for (const bloom of bloomDays) {
      if (bloom <= day) {
        run += 1;
        if (run === size) { made += 1; run = 0; }
      } else run = 0;
    }
    return made >= bouquets;
  };
  let left = Math.min(...bloomDays);
  let right = Math.max(...bloomDays);
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (can(mid)) right = mid;
    else left = mid + 1;
  }
  return left;
}
