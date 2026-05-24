object Solution {
  def canPlantFlowers(bed: Seq[Int], k: Int): Boolean = {
    val plots = bed.toArray
    var planted = 0
    for (index <- plots.indices) {
      val leftEmpty = index == 0 || plots(index - 1) == 0
      val rightEmpty = index == plots.length - 1 || plots(index + 1) == 0
      if (plots(index) == 0 && leftEmpty && rightEmpty) { plots(index) = 1; planted += 1; if (planted >= k) return true }
    }
    planted >= k
  }
}
