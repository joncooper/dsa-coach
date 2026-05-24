object Solution {
  def binarySearch(nums: Seq[Int], target: Int): Int = {
    var left = 0; var right = nums.length - 1
    while (left <= right) { val mid = (left + right) / 2; if (nums(mid) == target) return mid; if (nums(mid) < target) left = mid + 1 else right = mid - 1 }
    -1
  }
}
