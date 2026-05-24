export function mostFrequentValue(values: number[]): number | null {
  if (values.length === 0) return null;
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  let best = values[0];
  for (const value of values) {
    if ((counts.get(value) ?? 0) > (counts.get(best) ?? 0)) best = value;
  }
  return best;
}
