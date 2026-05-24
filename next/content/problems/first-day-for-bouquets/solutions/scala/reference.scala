object Solution {
  def firstDayForBouquets(bloomDays: Seq[Int], bouquets: Int, size: Int): Int = {
    if (bouquets * size > bloomDays.length) return -1
    def can(day: Int): Boolean = { var made = 0; var run = 0; for (bloom <- bloomDays) { if (bloom <= day) { run += 1; if (run == size) { made += 1; run = 0 } } else run = 0 }; made >= bouquets }
    var left = bloomDays.min; var right = bloomDays.max
    while (left < right) { val mid = (left + right) / 2; if (can(mid)) right = mid else left = mid + 1 }
    left
  }
}
