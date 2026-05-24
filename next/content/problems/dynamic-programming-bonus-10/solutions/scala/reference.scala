object Solution {
  def longestPalindromeLength(text: String): Int = {
    var best = 0
    def expand(leftStart: Int, rightStart: Int): Unit = { var left = leftStart; var right = rightStart; while (left >= 0 && right < text.length && text(left) == text(right)) { left -= 1; right += 1 }; best = math.max(best, right - left - 1) }
    for (center <- text.indices) { expand(center, center); expand(center, center + 1) }
    best
  }
}
