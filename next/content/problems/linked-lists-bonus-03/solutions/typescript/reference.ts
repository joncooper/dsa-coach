export function maxListValue(values: number[]): number | null {
  if (values.length === 0) return null;
  let best = values[0];
  for (const value of values) best = Math.max(best, value);
  return best;
}
