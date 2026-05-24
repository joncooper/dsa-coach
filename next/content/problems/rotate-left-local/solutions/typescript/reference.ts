export function rotateLeft(nums: number[], k: number): number[] {
  if (nums.length === 0) return [];
  const offset = k % nums.length;
  return nums.slice(offset).concat(nums.slice(0, offset));
}
