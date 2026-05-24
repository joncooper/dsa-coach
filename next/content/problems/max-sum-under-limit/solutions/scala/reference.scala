object Solution {
  def maxSumUnderLimit(nums: Seq[Int], limit: Int): Int = {
    var left = 0
    var total = 0
    var best = 0
    for (right <- nums.indices) {
      total += nums(right)
      while (left <= right && total > limit) {
        total -= nums(left)
        left += 1
      }
      best = math.max(best, total)
    }
    best
  }
}
