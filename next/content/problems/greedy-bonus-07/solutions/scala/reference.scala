object Solution {
  def minRooms(intervals: Seq[Seq[Int]]): Int = {
    val starts = intervals.map(_(0)).sorted
    val ends = intervals.map(_(1)).sorted
    var endIndex = 0; var active = 0; var best = 0
    for (start <- starts) { while (endIndex < ends.length && ends(endIndex) <= start) { active -= 1; endIndex += 1 }; active += 1; best = math.max(best, active) }
    best
  }
}
