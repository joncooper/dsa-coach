object Solution {
  def islandPerimeter(grid: Seq[Seq[Int]]): Int = {
    var perimeter = 0
    for (row <- grid.indices; col <- grid(row).indices) {
      if (grid(row)(col) == 1) {
        perimeter += 4
        if (row > 0 && grid(row - 1)(col) == 1) perimeter -= 2
        if (col > 0 && grid(row)(col - 1) == 1) perimeter -= 2
      }
    }
    perimeter
  }
}
