object Solution {
  def heapsort(nums: Seq[Int]): Seq[Int] = {
    val heap = scala.collection.mutable.PriorityQueue.empty[Int](Ordering.Int.reverse)
    heap.enqueue(nums: _*)
    heap.dequeueAll
  }
}
