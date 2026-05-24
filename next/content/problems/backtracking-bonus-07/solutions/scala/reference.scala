object Solution {
  def countNQueens(n: Int): Int = {
    if (n <= 0) return 0
    val cols = scala.collection.mutable.Set.empty[Int]
    val diag1 = scala.collection.mutable.Set.empty[Int]
    val diag2 = scala.collection.mutable.Set.empty[Int]
    var count = 0
    def backtrack(row: Int): Unit = {
      if (row == n) { count += 1; return }
      for (col <- 0 until n if !cols(col) && !diag1(row - col) && !diag2(row + col)) { cols.add(col); diag1.add(row - col); diag2.add(row + col); backtrack(row + 1); cols.remove(col); diag1.remove(row - col); diag2.remove(row + col) }
    }
    backtrack(0)
    count
  }
}
