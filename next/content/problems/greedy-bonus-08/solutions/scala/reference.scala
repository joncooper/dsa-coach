object Solution {
  def maxSumAfterFlips(nums: Seq[Int], k: Int): Int = {
    val values = nums.sorted.toArray
    var remaining = k
    var index = 0
    while (index < values.length && remaining > 0 && values(index) < 0) { values(index) = -values(index); remaining -= 1; index += 1 }
    var total = values.sum
    val smallestAbs = values.map(math.abs).min
    if (remaining % 2 == 1) total -= 2 * smallestAbs
    total
  }
}
