object Solution {
  def largestSquare(grid: Seq[Seq[Int]]): Int = {
    if (grid.isEmpty || grid.head.isEmpty) return 0
    val rows = grid.length; val cols = grid.head.length
    val dp = Array.fill(rows, cols)(0)
    var best = 0
    for (row <- 0 until rows; col <- 0 until cols) if (grid(row)(col) == 1) { dp(row)(col) = if (row == 0 || col == 0) 1 else 1 + Seq(dp(row - 1)(col), dp(row)(col - 1), dp(row - 1)(col - 1)).min; best = math.max(best, dp(row)(col)) }
    best * best
  }
}
