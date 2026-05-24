object Solution {
  def twoSumSorted(nums: Seq[Int], target: Int): Seq[Int] = {
    var left = 0
    var right = nums.length - 1
    while (left < right) {
      val total = nums(left) + nums(right)
      if (total == target) return Seq(left, right)
      if (total < target) left += 1 else right -= 1
    }
    Seq(-1, -1)
  }
}
