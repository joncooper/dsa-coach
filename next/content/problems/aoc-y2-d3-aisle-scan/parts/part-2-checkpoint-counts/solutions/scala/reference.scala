object Solution {
  def scan_checkpoints(inputText: String): Int = {
    val prior = scala.collection.mutable.ArrayBuffer.empty[Int]
    var exceeded = 0

    for (row <- inputText.linesIterator.filter(_.nonEmpty)) {
      val count = row.takeWhile(_ != '#').count(_ == '*')
      if (prior.nonEmpty && count > prior((prior.length - 1) / 2)) exceeded += 1
      prior.insert(lowerBound(prior, count), count)
    }

    exceeded
  }

  private def lowerBound(values: scala.collection.mutable.ArrayBuffer[Int], target: Int): Int = {
    var lo = 0
    var hi = values.length
    while (lo < hi) {
      val mid = (lo + hi) / 2
      if (values(mid) < target) lo = mid + 1 else hi = mid
    }
    lo
  }
}
