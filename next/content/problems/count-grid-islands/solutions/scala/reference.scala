object Solution {
  def countGridIslands(grid: Seq[Seq[Int]]): Int = {
    if (grid.isEmpty) return 0
    val rows = grid.length; val cols = grid.head.length
    val seen = Array.fill(rows, cols)(false)
    var islands = 0
    val dirs = Seq((1, 0), (-1, 0), (0, 1), (0, -1))
    for (row <- 0 until rows; col <- 0 until cols) {
      if (grid(row)(col) == 1 && !seen(row)(col)) {
        islands += 1
        val stack = scala.collection.mutable.Stack((row, col))
        seen(row)(col) = true
        while (stack.nonEmpty) {
          val (r, c) = stack.pop()
          for ((dr, dc) <- dirs) {
            val nr = r + dr; val nc = c + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid(nr)(nc) == 1 && !seen(nr)(nc)) {
              seen(nr)(nc) = true; stack.push((nr, nc))
            }
          }
        }
      }
    }
    islands
  }
}
