object Solution {
  def maxSubarraySum(nums: Seq[Int]): Int = {
    var best = nums.head
    var current = nums.head
    for (index <- 1 until nums.length) {
      current = math.max(nums(index), current + nums(index))
      best = math.max(best, current)
    }
    best
  }
}
