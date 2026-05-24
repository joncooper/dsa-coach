export function secondLargest(values: number[]): number | null {
  let largest: number | null = null;
  let second: number | null = null;
  for (const value of values) {
    if (largest === null || value > largest) {
      if (largest !== null && value !== largest) second = largest;
      largest = value;
    } else if (value !== largest && (second === null || value > second)) {
      second = value;
    }
  }
  return second;
}
