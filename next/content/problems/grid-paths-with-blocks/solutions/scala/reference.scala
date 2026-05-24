object Solution {
  def gridPathsWithBlocks(grid: Seq[Seq[Int]]): Int = {
    if (grid.isEmpty || grid.head.isEmpty || grid.head.head == 1) return 0
    val cols = grid.head.length
    val dp = Array.fill(cols)(0)
    dp(0) = 1
    for (row <- grid.indices; col <- 0 until cols) { if (grid(row)(col) == 1) dp(col) = 0 else if (col > 0) dp(col) += dp(col - 1) }
    dp(cols - 1)
  }
}
