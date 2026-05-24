object Solution {
  def maxScoreAfterHalving(nums: Seq[Int], k: Int): Int = {
    var values = nums
    for (_ <- 0 until k) {
      values = values.sorted(Ordering.Int.reverse)
      if (values.isEmpty || values.head <= 1) return values.sum
      values = (math.ceil(values.head / 2.0).toInt +: values.tail)
    }
    values.sum
  }
}
