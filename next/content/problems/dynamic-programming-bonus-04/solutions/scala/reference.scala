object Solution {
  def minPathSum(grid: Seq[Seq[Int]]): Int = {
    if (grid.isEmpty || grid.head.isEmpty) return 0
    val rows = grid.length; val cols = grid.head.length
    val dp = Array.fill(rows, cols)(0)
    for (row <- 0 until rows; col <- 0 until cols) { if (row == 0 && col == 0) dp(row)(col) = grid(row)(col) else dp(row)(col) = grid(row)(col) + math.min(if (row > 0) dp(row - 1)(col) else Int.MaxValue / 4, if (col > 0) dp(row)(col - 1) else Int.MaxValue / 4) }
    dp(rows - 1)(cols - 1)
  }
}
