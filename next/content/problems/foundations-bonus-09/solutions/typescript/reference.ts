export function countDistinct(values: number[]): number {
  return new Set(values).size;
}
