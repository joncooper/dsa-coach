object Solution {
  def max_seat_id(inputText: String): Int =
    inputText.linesIterator.map(_.trim).filter(_.nonEmpty).map(seatId).foldLeft(-1)(math.max)

  private def seatId(code: String): Int =
    Integer.parseInt(code.map {
      case 'F' | 'L' => '0'
      case 'B' | 'R' => '1'
      case other => other
    }, 2)
}
