object Solution {
  def closestPairSum(nums: Seq[Int], target: Int): Int = {
    var left = 0
    var right = nums.length - 1
    var best = nums(0) + nums(1)
    while (left < right) {
      val total = nums(left) + nums(right)
      val better = math.abs(total - target) < math.abs(best - target)
      val tiedSmaller = math.abs(total - target) == math.abs(best - target) && total < best
      if (better || tiedSmaller) best = total
      if (total < target) left += 1
      else if (total > target) right -= 1
      else return total
    }
    best
  }
}
