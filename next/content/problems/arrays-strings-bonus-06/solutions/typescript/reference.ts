export function plusOne(digits: number[]): number[] {
  const result = digits.slice();
  let carry = 1;
  for (let index = result.length - 1; index >= 0; index -= 1) {
    const value = result[index] + carry;
    result[index] = value % 10;
    carry = Math.floor(value / 10);
    if (carry === 0) break;
  }
  if (carry > 0) result.unshift(carry);
  return result;
}
