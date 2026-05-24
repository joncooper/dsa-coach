object Solution {
  def shortestGridPath(grid: Seq[Seq[Int]]): Int = {
    if (grid.isEmpty || grid.head.isEmpty || grid(0)(0) == 1) return -1
    val rows = grid.length; val cols = grid.head.length
    if (grid(rows - 1)(cols - 1) == 1) return -1
    val queue = scala.collection.mutable.Queue((0, 0, 0))
    val seen = scala.collection.mutable.Set((0, 0))
    val dirs = Seq((1, 0), (-1, 0), (0, 1), (0, -1))
    while (queue.nonEmpty) {
      val (row, col, distance) = queue.dequeue()
      if (row == rows - 1 && col == cols - 1) return distance
      for ((dr, dc) <- dirs) {
        val nr = row + dr; val nc = col + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid(nr)(nc) == 0 && !seen.contains((nr, nc))) {
          seen.add((nr, nc)); queue.enqueue((nr, nc, distance + 1))
        }
      }
    }
    -1
  }
}
