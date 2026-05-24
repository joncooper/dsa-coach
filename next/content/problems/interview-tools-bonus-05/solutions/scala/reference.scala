object Solution {
  def countIslands(grid: Seq[Seq[Int]]): Int = {
    if (grid.isEmpty || grid.head.isEmpty) return 0
    val rows = grid.length; val cols = grid.head.length
    val visited = Array.fill(rows, cols)(false)
    def dfs(row: Int, col: Int): Unit = { if (row < 0 || row >= rows || col < 0 || col >= cols || visited(row)(col) || grid(row)(col) == 0) return; visited(row)(col) = true; dfs(row + 1, col); dfs(row - 1, col); dfs(row, col + 1); dfs(row, col - 1) }
    var islands = 0
    for (row <- 0 until rows; col <- 0 until cols) if (grid(row)(col) == 1 && !visited(row)(col)) { islands += 1; dfs(row, col) }
    islands
  }
}
