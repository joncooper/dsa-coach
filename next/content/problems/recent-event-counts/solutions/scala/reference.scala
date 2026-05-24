object Solution {
  def recentEventCounts(timestamps: Seq[Int], window: Int): Seq[Int] = {
    var left = 0
    val counts = scala.collection.mutable.ArrayBuffer.empty[Int]
    for (right <- timestamps.indices) {
      val timestamp = timestamps(right)
      while (timestamps(left) < timestamp - window) left += 1
      counts.append(right - left + 1)
    }
    counts.toSeq
  }
}
