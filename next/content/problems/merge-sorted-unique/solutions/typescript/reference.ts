export function mergeSortedUnique(a: number[], b: number[]): number[] {
  const result: number[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    let value: number;
    if (j >= b.length || (i < a.length && a[i] <= b[j])) {
      value = a[i];
      i += 1;
    } else {
      value = b[j];
      j += 1;
    }
    if (result.length === 0 || result[result.length - 1] !== value) result.push(value);
  }
  return result;
}
