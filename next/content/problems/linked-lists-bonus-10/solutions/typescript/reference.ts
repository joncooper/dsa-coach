export function swapPairs(values: number[]): number[] {
  const result = [...values];
  for (let index = 0; index + 1 < result.length; index += 2) {
    const temp = result[index];
    result[index] = result[index + 1];
    result[index + 1] = temp;
  }
  return result;
}
