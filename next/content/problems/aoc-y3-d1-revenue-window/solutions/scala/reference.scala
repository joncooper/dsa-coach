object Solution {
  def max_revenue_window(inputText: String): Int = {
    val lines = inputText.linesIterator.map(_.trim).filter(_.nonEmpty).toVector
    if (lines.isEmpty) return 0

    val window = lines.head.toInt
    val days = lines.tail.map(_.toInt)
    if (days.length < window) return 0

    var current = days.take(window).sum
    var best = current
    for (i <- window until days.length) {
      current += days(i) - days(i - window)
      best = math.max(best, current)
    }
    best
  }
}
