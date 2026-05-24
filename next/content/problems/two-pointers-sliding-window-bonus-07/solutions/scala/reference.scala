object Solution {
  def minWindowForSum(nums: Seq[Int], target: Int): Int = {
    var left = 0
    var total = 0
    var best = Int.MaxValue
    for (right <- nums.indices) {
      total += nums(right)
      while (total >= target) {
        best = math.min(best, right - left + 1)
        total -= nums(left)
        left += 1
      }
    }
    if (best == Int.MaxValue) 0 else best
  }
}
