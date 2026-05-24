export function rangeSumQueries(nums: number[], queries: number[][]): number[] {
  const prefix = [0];
  for (const num of nums) prefix.push(prefix[prefix.length - 1] + num);
  return queries.map(([lo, hi]) => prefix[hi + 1] - prefix[lo]);
}
