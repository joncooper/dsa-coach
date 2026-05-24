export function shipCapacityLocal(weights: number[], days: number): number {
  const can = (capacity: number) => {
    let usedDays = 1;
    let load = 0;
    for (const weight of weights) {
      if (load + weight > capacity) { usedDays += 1; load = 0; }
      load += weight;
    }
    return usedDays <= days;
  };
  let left = Math.max(...weights);
  let right = weights.reduce((sum, value) => sum + value, 0);
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (can(mid)) right = mid;
    else left = mid + 1;
  }
  return left;
}
