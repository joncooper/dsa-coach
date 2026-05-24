export function insertAfterIndex(values: number[], index: number, value: number): number[] {
  if (index < 0 || index >= values.length) return [...values];
  return values.slice(0, index + 1).concat([value], values.slice(index + 1));
}
