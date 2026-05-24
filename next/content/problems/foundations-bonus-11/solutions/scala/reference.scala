object Solution {
  def pivotIndex(nums: Seq[Int]): Int = {
    val total = nums.sum
    var left = 0
    for ((num, index) <- nums.zipWithIndex) {
      if (left == total - left - num) return index
      left += num
    }
    -1
  }
}
