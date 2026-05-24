export function maxTruckValue(boxes: number[][], capacity: number): number {
  const sorted = [...boxes].sort((a, b) => b[1] - a[1]);
  let remaining = capacity;
  let total = 0;
  for (const [units, value] of sorted) {
    const take = Math.min(units, remaining);
    total += take * value;
    remaining -= take;
    if (remaining === 0) break;
  }
  return total;
}
