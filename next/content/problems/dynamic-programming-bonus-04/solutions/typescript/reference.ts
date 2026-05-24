export function minPathSum(grid: number[][]): number {
  if (grid.length === 0 || grid[0].length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  const dp = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (row === 0 && col === 0) dp[row][col] = grid[row][col];
      else dp[row][col] = grid[row][col] + Math.min(row > 0 ? dp[row - 1][col] : Infinity, col > 0 ? dp[row][col - 1] : Infinity);
    }
  }
  return dp[rows - 1][cols - 1];
}
