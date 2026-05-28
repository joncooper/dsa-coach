object Solution {
  def find_missing_stamp(inputText: String): Int = {
    val values = inputText.linesIterator.map(_.trim).filter(_.nonEmpty).map(Integer.parseInt(_, 36)).toVector.sorted
    for (pair <- values.sliding(2) if pair.length == 2 && pair(1) - pair(0) == 2) return pair(0) + 1
    -1
  }
}
