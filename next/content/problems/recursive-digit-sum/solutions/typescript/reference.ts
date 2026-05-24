export function recursiveDigitSum(n: number): number {
  if (n < 10) return n;
  return (n % 10) + recursiveDigitSum(Math.floor(n / 10));
}
