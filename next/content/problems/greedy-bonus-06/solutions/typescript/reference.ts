export function startStation(fuel: number[], cost: number[]): number {
  if (fuel.length === 0) return 0;
  let total = 0;
  let tank = 0;
  let start = 0;
  for (let index = 0; index < fuel.length; index += 1) {
    const diff = fuel[index] - cost[index];
    total += diff;
    tank += diff;
    if (tank < 0) {
      start = index + 1;
      tank = 0;
    }
  }
  return total >= 0 ? start : -1;
}
