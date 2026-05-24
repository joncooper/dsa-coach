object Solution {
  def minEatingSpeed(piles: Seq[Int], hours: Int): Int = {
    def neededHours(speed: Int): Int = piles.map(pile => (pile + speed - 1) / speed).sum
    var left = 1; var right = piles.max
    while (left < right) { val mid = (left + right) / 2; if (neededHours(mid) <= hours) right = mid else left = mid + 1 }
    left
  }
}
