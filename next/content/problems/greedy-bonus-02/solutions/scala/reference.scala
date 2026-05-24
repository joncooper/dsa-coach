object Solution {
  def maxTruckValue(boxes: Seq[Seq[Int]], capacity: Int): Int = {
    var remaining = capacity
    var total = 0
    for (box <- boxes.sortBy(_(1))(Ordering.Int.reverse)) { val take = math.min(box(0), remaining); total += take * box(1); remaining -= take }
    total
  }
}
