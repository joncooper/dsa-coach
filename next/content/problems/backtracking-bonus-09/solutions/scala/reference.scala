object Solution {
  def countLatinCompletions(grid: Seq[Seq[Int]]): Int = {
    val n = grid.length
    if (n == 0) return 0
    if (grid.exists(_.length != n)) return 0
    val rowsUsed = Array.fill(n)(scala.collection.mutable.Set.empty[Int])
    val colsUsed = Array.fill(n)(scala.collection.mutable.Set.empty[Int])
    val blanks = scala.collection.mutable.ArrayBuffer.empty[(Int, Int)]
    for (row <- 0 until n; col <- 0 until n) {
      val value = grid(row)(col)
      if (value == 0) blanks.append((row, col))
      else { if (value < 1 || value > n || rowsUsed(row)(value) || colsUsed(col)(value)) return 0; rowsUsed(row).add(value); colsUsed(col).add(value) }
    }
    var count = 0
    def backtrack(index: Int): Unit = {
      if (index == blanks.length) { count += 1; return }
      val (row, col) = blanks(index)
      for (value <- 1 to n if !rowsUsed(row)(value) && !colsUsed(col)(value)) { rowsUsed(row).add(value); colsUsed(col).add(value); backtrack(index + 1); rowsUsed(row).remove(value); colsUsed(col).remove(value) }
    }
    backtrack(0)
    count
  }
}
