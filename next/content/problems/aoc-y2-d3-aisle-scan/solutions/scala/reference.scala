object Solution {
  def scan_aisle(inputText: String): Int =
    inputText.linesIterator.filter(_.nonEmpty).map { row =>
      row.takeWhile(_ != '#').count(_ == '*')
    }.sum
}
