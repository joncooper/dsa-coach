export function moveZeros(nums: number[]): number[] {
  const nonZero = nums.filter((num) => num !== 0);
  return nonZero.concat(new Array(nums.length - nonZero.length).fill(0));
}
