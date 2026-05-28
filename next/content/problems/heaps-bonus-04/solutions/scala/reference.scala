object Solution {
  def minConnectCost(ropes: Seq[Int]): Int = {
    val heap = scala.collection.mutable.PriorityQueue.empty[Int](Ordering.Int.reverse)
    heap.enqueue(ropes: _*)
    var cost = 0
    while (heap.size > 1) {
      val merged = heap.dequeue() + heap.dequeue()
      cost += merged
      heap.enqueue(merged)
    }
    cost
  }
}
