export function halveStepCount(n: number): number {
  let steps = 0;
  while (n > 0) {
    n = Math.floor(n / 2);
    steps += 1;
  }
  return steps;
}
