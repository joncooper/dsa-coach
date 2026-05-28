object Solution {
  def diagonal_count(inputText: String): Int = {
    val rows = inputText.linesIterator.filter(_.nonEmpty).toVector
    if (rows.isEmpty) return 0

    var row = 0
    var col = 0
    var total = 0

    while (row < rows.length && col < rows.head.length) {
      rows(row).charAt(col) match {
        case '#' => return total
        case 'T' => total += 1
        case _ =>
      }
      row += 1
      col += 1
    }

    total
  }
}
