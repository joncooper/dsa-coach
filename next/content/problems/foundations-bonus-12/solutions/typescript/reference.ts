export function collatzSteps(n: number): number {
  let value = n;
  let steps = 0;
  while (value !== 1) {
    value = value % 2 === 0 ? value / 2 : value * 3 + 1;
    steps += 1;
  }
  return steps;
}
