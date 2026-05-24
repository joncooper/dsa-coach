object Solution {
  def findPeakElement(nums: Seq[Int]): Int = {
    var left = 0; var right = nums.length - 1
    while (left < right) { val mid = (left + right) / 2; if (nums(mid) < nums(mid + 1)) left = mid + 1 else right = mid }
    left
  }
}
