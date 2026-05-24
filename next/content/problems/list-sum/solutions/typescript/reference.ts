export function listSum(values: number[]): number {
  let total = 0;
  for (const value of values) total += value;
  return total;
}
