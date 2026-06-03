object Solution {
  def coveredServiceTime(windows: Seq[Seq[Int]]): Int = {
    if (windows.isEmpty) {
      return 0
    }

    val ordered = windows.sortBy(window => (window(0), window(1)))
    var currentStart = ordered.head(0)
    var currentEnd = ordered.head(1)
    var total = 0

    for (window <- ordered.tail) {
      val start = window(0)
      val end = window(1)

      if (start > currentEnd) {
        total += currentEnd - currentStart
        currentStart = start
        currentEnd = end
      } else {
        currentEnd = math.max(currentEnd, end)
      }
    }

    total + currentEnd - currentStart
  }
}
