export function countLatinCompletions(grid: number[][]): number {
  const n = grid.length;
  if (n === 0) return 0;
  for (const row of grid) if (row.length !== n) return 0;
  const rowsUsed = Array.from({ length: n }, () => new Set<number>());
  const colsUsed = Array.from({ length: n }, () => new Set<number>());
  const blanks: Array<[number, number]> = [];
  for (let row = 0; row < n; row += 1) {
    for (let col = 0; col < n; col += 1) {
      const value = grid[row][col];
      if (value === 0) { blanks.push([row, col]); continue; }
      if (value < 1 || value > n || rowsUsed[row].has(value) || colsUsed[col].has(value)) return 0;
      rowsUsed[row].add(value);
      colsUsed[col].add(value);
    }
  }
  let count = 0;
  const backtrack = (index: number) => {
    if (index === blanks.length) { count += 1; return; }
    const [row, col] = blanks[index];
    for (let value = 1; value <= n; value += 1) {
      if (rowsUsed[row].has(value) || colsUsed[col].has(value)) continue;
      rowsUsed[row].add(value); colsUsed[col].add(value);
      backtrack(index + 1);
      rowsUsed[row].delete(value); colsUsed[col].delete(value);
    }
  };
  backtrack(0);
  return count;
}
