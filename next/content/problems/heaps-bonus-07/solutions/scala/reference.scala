object Solution {
  def kWeakestRows(grid: Seq[Seq[Int]], k: Int): Seq[Int] = {
    grid.zipWithIndex.map { case (row, index) => (row.sum, index) }.sortBy(identity).take(k).map(_._2)
  }
}
