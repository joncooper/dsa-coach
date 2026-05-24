export function valueAtIndex(values: number[], index: number): number | null {
  if (index < 0 || index >= values.length) return null;
  return values[index];
}
