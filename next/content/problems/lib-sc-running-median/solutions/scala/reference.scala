object Solution {
  def runningMedian(stream: Seq[Int]): Seq[Double] = {
    val values = scala.collection.mutable.ArrayBuffer.empty[Int]
    val out = scala.collection.mutable.ArrayBuffer.empty[Double]
    for (value <- stream) {
      insertSorted(values, value)
      val n = values.length
      if (n % 2 == 1) out.append(values(n / 2).toDouble)
      else out.append((values(n / 2 - 1) + values(n / 2)) / 2.0)
    }
    out.toSeq
  }

  private def insertSorted(values: scala.collection.mutable.ArrayBuffer[Int], value: Int): Unit = {
    var left = 0
    var right = values.length
    while (left < right) {
      val mid = (left + right) / 2
      if (values(mid) < value) left = mid + 1
      else right = mid
    }
    values.insert(left, value)
  }
}
