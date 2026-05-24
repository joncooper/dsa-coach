object Solution {
  def runningRangeWidth(nums: Seq[Int]): Seq[Int] = {
    val result = scala.collection.mutable.ArrayBuffer.empty[Int]
    var low: Option[Int] = None
    var high: Option[Int] = None
    for (num <- nums) {
      low = Some(low.fold(num)(current => math.min(current, num)))
      high = Some(high.fold(num)(current => math.max(current, num)))
      result.append(high.get - low.get)
    }
    result.toSeq
  }
}
