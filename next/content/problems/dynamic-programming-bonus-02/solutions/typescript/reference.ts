export function countBinaryStrings(n: number): number {
  let endZero = 1;
  let endOne = 0;
  for (let index = 0; index < n; index += 1) {
    const nextZero = endZero + endOne;
    const nextOne = endZero;
    endZero = nextZero;
    endOne = nextOne;
  }
  return endZero + endOne;
}
