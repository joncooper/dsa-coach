export function sortBinaryArray(bits: number[]): number[] {
  const result = bits.slice();
  let left = 0;
  let right = result.length - 1;
  while (left < right) {
    while (left < right && result[left] === 0) left += 1;
    while (left < right && result[right] === 1) right -= 1;
    if (left < right) {
      result[left] = 0;
      result[right] = 1;
    }
  }
  return result;
}
