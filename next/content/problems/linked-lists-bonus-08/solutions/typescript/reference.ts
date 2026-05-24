export function removeNthFromEnd(values: number[], n: number): number[] {
  const index = values.length - n;
  if (index < 0 || index >= values.length) return [...values];
  return values.slice(0, index).concat(values.slice(index + 1));
}
