object Solution {
  def maxCompatibleMeetings(intervals: Seq[Seq[Int]]): Int = {
    var count = 0
    var currentEnd = Int.MinValue
    for (interval <- intervals.sortBy(item => (item(1), item(0)))) {
      if (interval(0) >= currentEnd) { count += 1; currentEnd = interval(1) }
    }
    count
  }
}
