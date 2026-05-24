object Solution {
  def runningMaximum(nums: Seq[Int]): Seq[Int] = {
    val result = scala.collection.mutable.ArrayBuffer.empty[Int]
    var best: Option[Int] = None
    for (num <- nums) {
      best = Some(best.fold(num)(current => math.max(current, num)))
      result.append(best.get)
    }
    result.toSeq
  }
}
