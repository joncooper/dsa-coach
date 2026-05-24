export function floodFill(grid: number[][], sr: number, sc: number, newValue: number): number[][] {
  const out = grid.map((row) => [...row]);
  const old = out[sr][sc];
  if (old === newValue) return out;
  const rows = out.length;
  const cols = out[0].length;
  const stack: Array<[number, number]> = [[sr, sc]];
  while (stack.length > 0) {
    const [row, col] = stack.pop()!;
    if (row < 0 || row >= rows || col < 0 || col >= cols || out[row][col] !== old) continue;
    out[row][col] = newValue;
    stack.push([row + 1, col], [row - 1, col], [row, col + 1], [row, col - 1]);
  }
  return out;
}
