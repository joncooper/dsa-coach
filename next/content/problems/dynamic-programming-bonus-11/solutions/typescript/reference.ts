export function largestSquare(grid: number[][]): number {
  if (grid.length === 0 || grid[0].length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  const dp = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  let best = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (grid[row][col] === 1) {
        dp[row][col] = row === 0 || col === 0 ? 1 : 1 + Math.min(dp[row - 1][col], dp[row][col - 1], dp[row - 1][col - 1]);
        best = Math.max(best, dp[row][col]);
      }
    }
  }
  return best * best;
}
