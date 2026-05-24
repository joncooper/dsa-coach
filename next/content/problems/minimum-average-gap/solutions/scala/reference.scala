object Solution {
  def minimumAverageGapIndex(nums: Seq[Int]): Int = {
    val total = nums.sum
    var left = 0
    var bestIndex = 0
    var bestGap = Int.MaxValue
    for ((num, index) <- nums.zipWithIndex) {
      left += num
      val rightCount = nums.length - index - 1
      val leftAverage = math.floor(left.toDouble / (index + 1)).toInt
      val rightAverage = if (rightCount == 0) 0 else math.floor((total - left).toDouble / rightCount).toInt
      val gap = math.abs(leftAverage - rightAverage)
      if (gap < bestGap) {
        bestGap = gap
        bestIndex = index
      }
    }
    bestIndex
  }
}
