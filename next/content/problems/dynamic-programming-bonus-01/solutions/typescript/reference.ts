export function tribonacci(n: number): number {
  if (n === 0) return 0;
  if (n <= 2) return 1;
  let a = 0, b = 1, c = 1;
  for (let index = 3; index <= n; index += 1) {
    const next = a + b + c;
    a = b; b = c; c = next;
  }
  return c;
}
