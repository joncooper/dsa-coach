object Solution {
  def longestMountain(nums: Seq[Int]): Int = {
    var best = 0
    var index = 1
    while (index < nums.length - 1) {
      val isPeak = nums(index - 1) < nums(index) && nums(index) > nums(index + 1)
      if (!isPeak) {
        index += 1
      } else {
        var left = index - 1
        while (left > 0 && nums(left - 1) < nums(left)) left -= 1
        var right = index + 1
        while (right < nums.length - 1 && nums(right) > nums(right + 1)) right += 1
        best = math.max(best, right - left + 1)
        index = right + 1
      }
    }
    best
  }
}
