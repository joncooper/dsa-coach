object Solution {
  def searchUnknownSize(nums: Seq[Int], target: Int): Int = {
    if (nums.isEmpty) return -1
    var bound = 1
    while (bound < nums.length && nums(bound) < target) bound *= 2
    var left = bound / 2; var right = math.min(bound, nums.length - 1)
    while (left <= right) { val mid = (left + right) / 2; if (nums(mid) == target) return mid; if (nums(mid) < target) left = mid + 1 else right = mid - 1 }
    -1
  }
}
