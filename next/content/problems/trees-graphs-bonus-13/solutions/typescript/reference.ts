export function shortestGridPath(grid: number[][]): number {
  if (grid.length === 0 || grid[0].length === 0 || grid[0][0] === 1) return -1;
  const rows = grid.length;
  const cols = grid[0].length;
  if (grid[rows - 1][cols - 1] === 1) return -1;
  const queue: Array<[number, number, number]> = [[0, 0, 0]];
  const seen = new Set<string>(["0,0"]);
  for (let index = 0; index < queue.length; index += 1) {
    const [row, col, distance] = queue[index];
    if (row === rows - 1 && col === cols - 1) return distance;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = row + dr;
      const nc = col + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0 && !seen.has(key)) {
        seen.add(key);
        queue.push([nr, nc, distance + 1]);
      }
    }
  }
  return -1;
}
