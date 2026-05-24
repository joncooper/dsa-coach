object Solution {
  def countSafeWindows(nums: Seq[Int], k: Int, limit: Int): Int = {
    if (k <= 0 || k > nums.length) return 0
    var windowSum = nums.take(k).sum
    var count = if (windowSum <= limit) 1 else 0
    for (right <- k until nums.length) {
      windowSum += nums(right) - nums(right - k)
      if (windowSum <= limit) count += 1
    }
    count
  }
}
