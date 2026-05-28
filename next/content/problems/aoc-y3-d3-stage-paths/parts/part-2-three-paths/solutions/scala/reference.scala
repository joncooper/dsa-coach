object Solution {
  def three_paths_sum(inputText: String): Int = {
    val rows = inputText.linesIterator.filter(_.nonEmpty).toVector
    if (rows.isEmpty) return 0

    var total = 0
    for ((dr, dc) <- Vector((1, 1), (1, 2), (2, 1))) {
      var row = 0
      var col = 0
      var blocked = false
      while (!blocked && row < rows.length && col < rows.head.length) {
        rows(row).charAt(col) match {
          case '#' => blocked = true
          case 'T' => total += 1
          case _ =>
        }
        row += dr
        col += dc
      }
    }

    total
  }
}
