export function floodFill(grid: number[][], sr: number, sc: number, color: number): number[][] {
  const result = grid.map((row) => [...row]);
  const original = result[sr][sc];
  if (original === color) return result;
  const rows = result.length;
  const cols = result[0].length;
  const stack: Array<[number, number]> = [[sr, sc]];
  result[sr][sc] = color;
  while (stack.length > 0) {
    const [row, col] = stack.pop()!;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && result[nr][nc] === original) {
        result[nr][nc] = color;
        stack.push([nr, nc]);
      }
    }
  }
  return result;
}
