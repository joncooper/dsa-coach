object Solution {
  def slope_walk_product(inputText: String): Int = {
    val rows = inputText.linesIterator.filter(_.nonEmpty).toVector
    if (rows.isEmpty) return 0

    val width = rows.head.length
    val slopes = Vector((1, 1), (3, 1), (5, 1), (7, 1), (1, 2))

    slopes.map { case (dx, dy) =>
      var row = 0
      var col = 0
      var trees = 0
      while (row < rows.length) {
        if (rows(row).charAt(col % width) == '#') trees += 1
        row += dy
        col += dx
      }
      trees
    }.product
  }
}
