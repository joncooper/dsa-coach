export function runningMedian(stream: number[]): number[] {
  const values: number[] = [];
  const out: number[] = [];
  for (const value of stream) {
    insertSorted(values, value);
    const n = values.length;
    out.push(n % 2 === 1 ? values[Math.floor(n / 2)] : (values[n / 2 - 1] + values[n / 2]) / 2);
  }
  return out;
}

function insertSorted(values: number[], value: number) {
  let left = 0;
  let right = values.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (values[mid] < value) left = mid + 1;
    else right = mid;
  }
  values.splice(left, 0, value);
}
