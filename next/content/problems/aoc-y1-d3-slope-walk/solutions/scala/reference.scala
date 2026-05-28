object Solution {
  def slope_walk(inputText: String): Int = {
    val rows = inputText.linesIterator.filter(_.nonEmpty).toVector
    if (rows.isEmpty) return 0

    val width = rows.head.length
    rows.indices.count(row => rows(row).charAt((row * 3) % width) == '#')
  }
}
