export function nthFibonacci(n: number): number {
  let previous = 0;
  let current = 1;
  for (let index = 0; index < n; index += 1) {
    const next = previous + current;
    previous = current;
    current = next;
  }
  return previous;
}
