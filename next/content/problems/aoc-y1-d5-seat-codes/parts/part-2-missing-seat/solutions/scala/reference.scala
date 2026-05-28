object Solution {
  def find_missing_seat(inputText: String): Int = {
    val ids = inputText.linesIterator.map(_.trim).filter(_.nonEmpty).map(seatId).toVector.sorted
    for (pair <- ids.sliding(2) if pair.length == 2 && pair(1) - pair(0) == 2) return pair(0) + 1
    -1
  }

  private def seatId(code: String): Int =
    Integer.parseInt(code.map {
      case 'F' | 'L' => '0'
      case 'B' | 'R' => '1'
      case other => other
    }, 2)
}
