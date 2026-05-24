object Solution {
  def longestBalancedPrefix(bits: Seq[Int]): Int = {
    val firstSeen = scala.collection.mutable.Map(0 -> -1)
    var balance = 0
    var best = 0
    for ((bit, index) <- bits.zipWithIndex) {
      balance += (if (bit == 1) 1 else -1)
      firstSeen.get(balance) match {
        case Some(previous) => best = math.max(best, index - previous)
        case None => firstSeen(balance) = index
      }
    }
    best
  }
}
