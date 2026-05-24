export function heapsort(nums: number[]): number[] {
  return [...nums].sort((a, b) => a - b);
}
