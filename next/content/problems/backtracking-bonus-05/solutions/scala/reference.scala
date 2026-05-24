object Solution {
  def countGridPaths(grid: Seq[Seq[Int]]): Int = {
    if (grid.isEmpty || grid.head.isEmpty) return 0
    val rows = grid.length; val cols = grid.head.length
    if (grid.head.head == 1 || grid(rows - 1)(cols - 1) == 1) return 0
    val visited = Array.fill(rows, cols)(false)
    var count = 0
    val dirs = Seq((1, 0), (-1, 0), (0, 1), (0, -1))
    def backtrack(row: Int, col: Int): Unit = {
      if (row == rows - 1 && col == cols - 1) { count += 1; return }
      for ((dr, dc) <- dirs) { val nr = row + dr; val nc = col + dc; if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited(nr)(nc) && grid(nr)(nc) == 0) { visited(nr)(nc) = true; backtrack(nr, nc); visited(nr)(nc) = false } }
    }
    visited(0)(0) = true
    backtrack(0, 0)
    count
  }
}
