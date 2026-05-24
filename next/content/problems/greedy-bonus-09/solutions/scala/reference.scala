object Solution {
  def countBoats(weights: Seq[Int], limit: Int): Int = {
    val sorted = weights.sorted
    var left = 0; var right = sorted.length - 1; var boats = 0
    while (left <= right) { if (sorted(left) + sorted(right) <= limit) left += 1; right -= 1; boats += 1 }
    boats
  }
}
