export function mergeTwoLinkedLists(a: number[], b: number[]): number[] {
  let left = 0;
  let right = 0;
  const merged: number[] = [];
  while (left < a.length && right < b.length) {
    if (a[left] <= b[right]) {
      merged.push(a[left]);
      left += 1;
    } else {
      merged.push(b[right]);
      right += 1;
    }
  }
  return merged.concat(a.slice(left), b.slice(right));
}
