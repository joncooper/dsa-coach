export function firstRepeatedValue(values: number[]): number | null {
  const seen = new Set<number>();
  for (const value of values) {
    if (seen.has(value)) return value;
    seen.add(value);
  }
  return null;
}
