object Solution {
  def subsetsOfSize(nums: Seq[Int], k: Int): Seq[Seq[Int]] = {
    val result = scala.collection.mutable.ArrayBuffer.empty[Seq[Int]]
    val chosen = scala.collection.mutable.ArrayBuffer.empty[Int]
    def backtrack(start: Int): Unit = {
      if (chosen.length == k) { result.append(chosen.toSeq); return }
      for (index <- start until nums.length) { chosen.append(nums(index)); backtrack(index + 1); chosen.remove(chosen.length - 1) }
    }
    if (k >= 0 && k <= nums.length) backtrack(0)
    result.toSeq.sortWith(compareSeq)
  }

  def compareSeq(left: Seq[Int], right: Seq[Int]): Boolean = {
    val limit = math.min(left.length, right.length)
    for (index <- 0 until limit) {
      if (left(index) != right(index)) return left(index) < right(index)
    }
    left.length < right.length
  }
}
