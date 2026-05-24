export function countGridPaths(grid: number[][]): number {
  if (grid.length === 0 || grid[0].length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  if (grid[0][0] === 1 || grid[rows - 1][cols - 1] === 1) return 0;
  const visited = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  let count = 0;
  const backtrack = (row: number, col: number) => {
    if (row === rows - 1 && col === cols - 1) { count += 1; return; }
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] && grid[nr][nc] === 0) {
        visited[nr][nc] = true;
        backtrack(nr, nc);
        visited[nr][nc] = false;
      }
    }
  };
  visited[0][0] = true;
  backtrack(0, 0);
  return count;
}
