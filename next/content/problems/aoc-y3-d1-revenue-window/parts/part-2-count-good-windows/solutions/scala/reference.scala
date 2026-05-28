object Solution {
  def rising_windows(inputText: String): Int = {
    val lines = inputText.linesIterator.map(_.trim).filter(_.nonEmpty).toVector
    if (lines.isEmpty) return 0

    val window = lines.head.toInt
    val days = lines.tail.map(_.toInt)
    if (days.length <= window) return 0

    var previous = days.take(window).sum
    var rising = 0
    for (i <- window until days.length) {
      val next = previous + days(i) - days(i - window)
      if (next > previous) rising += 1
      previous = next
    }
    rising
  }
}
