export function countGridIslands(grid: number[][]): number {
  if (grid.length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  const seen = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  let islands = 0;
  const stack: Array<[number, number]> = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (grid[row][col] !== 1 || seen[row][col]) continue;
      islands += 1;
      seen[row][col] = true;
      stack.push([row, col]);
      while (stack.length > 0) {
        const [r, c] = stack.pop()!;
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1 && !seen[nr][nc]) {
            seen[nr][nc] = true;
            stack.push([nr, nc]);
          }
        }
      }
    }
  }
  return islands;
}
