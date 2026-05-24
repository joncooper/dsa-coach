export function kClosestNumbers(nums: number[], target: number, k: number): number[] {
  return [...nums]
    .sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b)
    .slice(0, k)
    .sort((a, b) => a - b);
}
