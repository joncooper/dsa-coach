export function middleListValue(values: number[]): number | null {
  if (values.length === 0) return null;
  return values[Math.floor(values.length / 2)];
}
