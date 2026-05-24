object Solution {
  def longestTwoValueRun(nums: Seq[Int]): Int = {
    val counts = scala.collection.mutable.Map.empty[Int, Int].withDefaultValue(0)
    var left = 0; var best = 0
    for (right <- nums.indices) { val value = nums(right); counts(value) += 1; while (counts.size > 2) { val leftValue = nums(left); counts(leftValue) -= 1; if (counts(leftValue) == 0) counts.remove(leftValue); left += 1 }; best = math.max(best, right - left + 1) }
    best
  }
}
