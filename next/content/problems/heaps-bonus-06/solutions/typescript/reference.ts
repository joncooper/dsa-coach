export function kthSmallestPairSum(a: number[], b: number[], k: number): number {
  const sums: number[] = [];
  for (const x of a) for (const y of b) sums.push(x + y);
  sums.sort((left, right) => left - right);
  return sums[k - 1];
}
