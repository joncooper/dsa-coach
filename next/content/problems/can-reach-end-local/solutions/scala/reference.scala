object Solution {
  def canReachEndLocal(jumps: Seq[Int]): Boolean = {
    var farthest = 0
    for (index <- jumps.indices) {
      if (index > farthest) return false
      farthest = math.max(farthest, index + jumps(index))
    }
    true
  }
}
