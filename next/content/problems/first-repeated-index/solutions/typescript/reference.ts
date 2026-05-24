export function firstRepeatedIndex(values: number[]): number {
  const seen = new Set<number>();
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (seen.has(value)) return index;
    seen.add(value);
  }
  return -1;
}
