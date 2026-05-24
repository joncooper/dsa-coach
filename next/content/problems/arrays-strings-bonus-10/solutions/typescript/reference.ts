export function diagonalSum(matrix: number[][]): number {
  let total = 0;
  const n = matrix.length;
  for (let index = 0; index < n; index += 1) {
    total += matrix[index][index];
    const other = n - 1 - index;
    if (other !== index) total += matrix[index][other];
  }
  return total;
}
