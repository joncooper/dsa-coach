export function countIslands(grid: number[][]): number {
  if (grid.length === 0 || grid[0].length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  const dfs = (row: number, col: number) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols || visited[row][col] || grid[row][col] === 0) return;
    visited[row][col] = true;
    dfs(row + 1, col); dfs(row - 1, col); dfs(row, col + 1); dfs(row, col - 1);
  };
  let islands = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (grid[row][col] === 1 && !visited[row][col]) { islands += 1; dfs(row, col); }
    }
  }
  return islands;
}
