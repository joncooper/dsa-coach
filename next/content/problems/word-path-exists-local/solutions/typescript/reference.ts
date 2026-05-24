export function wordPathExistsLocal(board: string[][], word: string): boolean {
  if (word.length === 0) return true;
  if (board.length === 0 || board[0].length === 0) return false;
  const rows = board.length;
  const cols = board[0].length;
  if (word.length > rows * cols) return false;
  const visited = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
  const dfs = (row: number, col: number, index: number): boolean => {
    if (index === word.length) return true;
    if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
    if (visited[row][col] || board[row][col] !== word[index]) return false;
    visited[row][col] = true;
    const found = dfs(row + 1, col, index + 1) || dfs(row - 1, col, index + 1) || dfs(row, col + 1, index + 1) || dfs(row, col - 1, index + 1);
    visited[row][col] = false;
    return found;
  };
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (dfs(row, col, 0)) return true;
    }
  }
  return false;
}
