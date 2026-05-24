object Solution {
  def longestTrueRun(flags: Seq[Boolean]): Int = {
    var best = 0
    var current = 0
    for (flag <- flags) {
      if (flag) {
        current += 1
        best = math.max(best, current)
      } else {
        current = 0
      }
    }
    best
  }
}
