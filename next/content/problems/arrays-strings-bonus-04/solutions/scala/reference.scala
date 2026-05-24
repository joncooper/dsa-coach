object Solution {
  def countEquilibriumIndices(nums: Seq[Int]): Int = {
    val total = nums.sum
    var left = 0
    var count = 0
    for (num <- nums) {
      if (left == total - left - num) count += 1
      left += num
    }
    count
  }
}
