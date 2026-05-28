object Solution {
  def maxScoreAfterHalving(nums: Seq[Int], k: Int): Int = {
    val heap = scala.collection.mutable.PriorityQueue.empty[Int]
    heap.enqueue(nums: _*)
    var total = nums.sum
    for (_ <- 0 until k if heap.nonEmpty) {
      val value = heap.dequeue()
      if (value <= 1) { heap.enqueue(value); return total }
      val reduced = (value + 1) / 2
      total -= value - reduced
      heap.enqueue(reduced)
    }
    total
  }
}
