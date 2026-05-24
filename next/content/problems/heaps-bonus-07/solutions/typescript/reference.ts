export function kWeakestRows(grid: number[][], k: number): number[] {
  return grid
    .map((row, index) => [row.reduce((sum, value) => sum + value, 0), index])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .slice(0, k)
    .map((entry) => entry[1]);
}
