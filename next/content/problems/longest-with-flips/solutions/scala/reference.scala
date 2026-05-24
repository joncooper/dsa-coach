object Solution {
  def longestWithFlips(bits: Seq[Int], k: Int): Int = {
    var left = 0
    var zeroes = 0
    var best = 0
    for (right <- bits.indices) {
      if (bits(right) == 0) zeroes += 1
      while (zeroes > k) {
        if (bits(left) == 0) zeroes -= 1
        left += 1
      }
      best = math.max(best, right - left + 1)
    }
    best
  }
}
