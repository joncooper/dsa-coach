export function islandPerimeter(grid: number[][]): number {
  let perimeter = 0;
  const rows = grid.length;
  const cols = rows === 0 ? 0 : grid[0].length;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (grid[row][col] !== 1) continue;
      perimeter += 4;
      if (row > 0 && grid[row - 1][col] === 1) perimeter -= 2;
      if (col > 0 && grid[row][col - 1] === 1) perimeter -= 2;
    }
  }
  return perimeter;
}
