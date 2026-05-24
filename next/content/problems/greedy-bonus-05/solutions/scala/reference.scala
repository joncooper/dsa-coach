object Solution {
  def minArrows(intervals: Seq[Seq[Int]]): Int = {
    var arrows = 0
    var arrow = Int.MinValue
    for (interval <- intervals.sortBy(item => (item(1), item(0)))) { if (interval(0) > arrow) { arrows += 1; arrow = interval(1) } }
    arrows
  }
}
