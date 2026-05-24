object Solution {
  def combinationSumExactLocal(nums: Seq[Int], target: Int): Seq[Seq[Int]] = {
    val ordered = nums.sorted
    val result = scala.collection.mutable.ArrayBuffer.empty[Seq[Int]]
    val path = scala.collection.mutable.ArrayBuffer.empty[Int]
    def backtrack(start: Int, remaining: Int): Unit = {
      if (remaining == 0) { result.append(path.toSeq); return }
      var previous: Option[Int] = None
      for (index <- start until ordered.length) {
        val value = ordered(index)
        if (!previous.contains(value) && value <= remaining) {
          path.append(value)
          backtrack(index + 1, remaining - value)
          path.remove(path.length - 1)
        }
        previous = Some(value)
      }
    }
    backtrack(0, target)
    result.toSeq
  }
}
