object Solution {
  case class PairEntry(sum: Int, i: Int, j: Int)

  def kthSmallestPairSum(a: Seq[Int], b: Seq[Int], k: Int): Int = {
    if (a.isEmpty || b.isEmpty || k <= 0) return 0
    implicit val ordering: Ordering[PairEntry] = Ordering.by[PairEntry, (Int, Int, Int)](entry => (entry.sum, entry.i, entry.j)).reverse
    val heap = scala.collection.mutable.PriorityQueue.empty[PairEntry]
    for (j <- 0 until math.min(b.length, k)) heap.enqueue(PairEntry(a.head + b(j), 0, j))

    var current = 0
    for (_ <- 0 until k if heap.nonEmpty) {
      val next = heap.dequeue()
      current = next.sum
      if (next.i + 1 < a.length) heap.enqueue(PairEntry(a(next.i + 1) + b(next.j), next.i + 1, next.j))
    }
    current
  }
}
