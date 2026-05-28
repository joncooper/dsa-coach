object Solution {
  case class RowEntry(strength: Int, index: Int)

  def kWeakestRows(grid: Seq[Seq[Int]], k: Int): Seq[Int] = {
    implicit val ordering: Ordering[RowEntry] = Ordering.by[RowEntry, (Int, Int)](entry => (entry.strength, entry.index)).reverse
    val heap = scala.collection.mutable.PriorityQueue.empty[RowEntry]
    for ((row, index) <- grid.zipWithIndex) heap.enqueue(RowEntry(row.sum, index))
    (0 until math.min(k, grid.length)).map(_ => heap.dequeue().index)
  }
}
