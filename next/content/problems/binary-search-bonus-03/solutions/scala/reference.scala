object Solution {
  def countOccurrences(nums: Seq[Int], target: Int): Int = {
    def lower(value: Int): Int = { var left = 0; var right = nums.length; while (left < right) { val mid = (left + right) / 2; if (nums(mid) < value) left = mid + 1 else right = mid }; left }
    lower(target + 1) - lower(target)
  }
}
