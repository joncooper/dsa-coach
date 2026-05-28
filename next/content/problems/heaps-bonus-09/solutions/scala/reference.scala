object Solution {
  case class CloseEntry(distance: Int, value: Int)

  def kClosestNumbers(nums: Seq[Int], target: Int, k: Int): Seq[Int] = {
    implicit val ordering: Ordering[CloseEntry] = Ordering.by[CloseEntry, (Int, Int)](entry => (entry.distance, entry.value)).reverse
    val heap = scala.collection.mutable.PriorityQueue.empty[CloseEntry]
    for (num <- nums) heap.enqueue(CloseEntry(math.abs(num - target), num))
    (0 until math.min(k, nums.length)).map(_ => heap.dequeue().value).sorted
  }
}
