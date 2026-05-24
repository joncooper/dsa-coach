export function dedupeSorted(nums: number[]): number[] {
  const result: number[] = [];
  for (const num of nums) {
    if (result.length === 0 || result[result.length - 1] !== num) result.push(num);
  }
  return result;
}
