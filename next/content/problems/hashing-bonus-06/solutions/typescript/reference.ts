export function symmetricDifferenceSize(a: number[], b: number[]): number {
  const left = new Set(a);
  const right = new Set(b);
  let total = 0;
  for (const value of left) if (!right.has(value)) total += 1;
  for (const value of right) if (!left.has(value)) total += 1;
  return total;
}
