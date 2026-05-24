object Solution {
  def countPairsBelow(nums: Seq[Int], threshold: Int): Int = {
    val values = nums.sorted
    var left = 0
    var right = values.length - 1
    var count = 0
    while (left < right) {
      if (values(left) + values(right) < threshold) {
        count += right - left
        left += 1
      } else right -= 1
    }
    count
  }
}
