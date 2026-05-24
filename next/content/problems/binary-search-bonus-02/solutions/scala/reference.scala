object Solution {
  def upperBound(nums: Seq[Int], target: Int): Int = {
    var left = 0; var right = nums.length
    while (left < right) { val mid = (left + right) / 2; if (nums(mid) <= target) left = mid + 1 else right = mid }
    left
  }
}
