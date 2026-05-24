export function mergeSorted(a: number[], b: number[]): number[] {
  const result: number[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) {
      result.push(a[i]);
      i += 1;
    } else {
      result.push(b[j]);
      j += 1;
    }
  }
  return result.concat(a.slice(i), b.slice(j));
}
