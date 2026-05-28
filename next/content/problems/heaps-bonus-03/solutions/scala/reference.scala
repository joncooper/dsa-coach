object Solution {
  def lastStoneWeight(stones: Seq[Int]): Int = {
    val heap = scala.collection.mutable.PriorityQueue.empty[Int]
    heap.enqueue(stones: _*)
    while (heap.size > 1) {
      val y = heap.dequeue()
      val x = heap.dequeue()
      if (x != y) heap.enqueue(y - x)
    }
    if (heap.isEmpty) 0 else heap.dequeue()
  }
}
