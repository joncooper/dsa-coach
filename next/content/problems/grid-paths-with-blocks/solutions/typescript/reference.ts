export function gridPathsWithBlocks(grid: number[][]): number {
  if (grid.length === 0 || grid[0].length === 0 || grid[0][0] === 1) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  const dp = new Array<number>(cols).fill(0);
  dp[0] = 1;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (grid[row][col] === 1) dp[col] = 0;
      else if (col > 0) dp[col] += dp[col - 1];
    }
  }
  return dp[cols - 1];
}
