export function printOrder(jobs: number[][]): number[] {
  return [...jobs].sort((a, b) => b[0] - a[0] || a[1] - b[1]).map((job) => job[1]);
}
