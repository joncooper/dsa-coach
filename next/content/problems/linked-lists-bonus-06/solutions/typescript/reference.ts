export function dedupSortedList(values: number[]): number[] {
  const result: number[] = [];
  for (const value of values) {
    if (result.length === 0 || result[result.length - 1] !== value) result.push(value);
  }
  return result;
}
