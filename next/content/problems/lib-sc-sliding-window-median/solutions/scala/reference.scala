object Solution {
  def slidingWindowMedian(nums: Seq[Int], k: Int): Seq[Double] = {
    if (nums.isEmpty || k <= 0 || k > nums.length) return Seq.empty
    val window = scala.collection.mutable.ArrayBuffer.from(nums.take(k).sorted)
    val out = scala.collection.mutable.ArrayBuffer.empty[Double]
    for (index <- 0 to nums.length - k) {
      if (k % 2 == 1) out.append(window(k / 2).toDouble)
      else out.append((window(k / 2 - 1) + window(k / 2)) / 2.0)
      if (index + k < nums.length) {
        removeOne(window, nums(index))
        insertSorted(window, nums(index + k))
      }
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

  private def removeOne(values: scala.collection.mutable.ArrayBuffer[Int], value: Int): Unit = {
    val index = values.indexOf(value)
    if (index >= 0) values.remove(index)
  }
}
