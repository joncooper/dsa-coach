object Solution {
  def kthLargest(nums: Seq[Int], k: Int): Int = {
    val heap = scala.collection.mutable.PriorityQueue.empty[Int](Ordering.Int.reverse)
    for (num <- nums) {
      if (heap.size < k) heap.enqueue(num)
      else if (num > heap.head) { heap.dequeue(); heap.enqueue(num) }
    }
    heap.head
  }
}
