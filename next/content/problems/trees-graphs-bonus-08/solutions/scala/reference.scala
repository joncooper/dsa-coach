object Solution {
  def floodFill(grid: Seq[Seq[Int]], sr: Int, sc: Int, color: Int): Seq[Seq[Int]] = {
    val result = grid.map(_.toArray).toArray
    val original = result(sr)(sc)
    if (original == color) return result.map(_.toSeq).toSeq
    val rows = result.length; val cols = result(0).length
    val stack = scala.collection.mutable.Stack((sr, sc))
    result(sr)(sc) = color
    val dirs = Seq((1, 0), (-1, 0), (0, 1), (0, -1))
    while (stack.nonEmpty) {
      val (row, col) = stack.pop()
      for ((dr, dc) <- dirs) {
        val nr = row + dr; val nc = col + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && result(nr)(nc) == original) {
          result(nr)(nc) = color; stack.push((nr, nc))
        }
      }
    }
    result.map(_.toSeq).toSeq
  }
}
