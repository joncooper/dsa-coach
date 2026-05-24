object Solution {
  def maxWaterArea(heights: Seq[Int]): Int = {
    var left = 0
    var right = heights.length - 1
    var best = 0
    while (left < right) {
      best = math.max(best, math.min(heights(left), heights(right)) * (right - left))
      if (heights(left) < heights(right)) left += 1 else right -= 1
    }
    best
  }
}
