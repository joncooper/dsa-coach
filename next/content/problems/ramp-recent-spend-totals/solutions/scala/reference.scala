object Solution {
  def recentSpendTotals(events: Seq[Seq[Int]], window: Int): Seq[Int] = {
    var left = 0
    var runningTotal = 0
    val totals = scala.collection.mutable.ArrayBuffer.empty[Int]

    for (event <- events) {
      val timestamp = event(0)
      val amount = event(1)
      runningTotal += amount

      while (events(left)(0) < timestamp - window) {
        runningTotal -= events(left)(1)
        left += 1
      }

      totals.append(runningTotal)
    }

    totals.toSeq
  }
}
