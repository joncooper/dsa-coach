object Solution {
  def longestDistinctSpan(text: String): Int = {
    val lastSeen = scala.collection.mutable.Map.empty[Char, Int]
    var left = 0
    var best = 0
    for (right <- text.indices) {
      val char = text.charAt(right)
      lastSeen.get(char).foreach { previous =>
        if (previous >= left) left = previous + 1
      }
      lastSeen(char) = right
      best = math.max(best, right - left + 1)
    }
    best
  }
}
