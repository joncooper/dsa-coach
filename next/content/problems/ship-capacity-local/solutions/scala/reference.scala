object Solution {
  def shipCapacityLocal(weights: Seq[Int], days: Int): Int = {
    def can(capacity: Int): Boolean = { var usedDays = 1; var load = 0; for (weight <- weights) { if (load + weight > capacity) { usedDays += 1; load = 0 }; load += weight }; usedDays <= days }
    var left = weights.max; var right = weights.sum
    while (left < right) { val mid = (left + right) / 2; if (can(mid)) right = mid else left = mid + 1 }
    left
  }
}
