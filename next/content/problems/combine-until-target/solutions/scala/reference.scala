object Solution {
  def combineUntilTarget(values: Seq[Int], target: Int): Int = {
    val heap = scala.collection.mutable.PriorityQueue.empty[Int](Ordering.Int.reverse)
    heap.enqueue(values: _*)
    var combines = 0
    while (heap.nonEmpty && heap.head < target) {
      if (heap.size < 2) return -1
      val small = heap.dequeue()
      val large = heap.dequeue()
      heap.enqueue(small + 2 * large)
      combines += 1
    }
    if (heap.isEmpty) -1 else combines
  }
}
