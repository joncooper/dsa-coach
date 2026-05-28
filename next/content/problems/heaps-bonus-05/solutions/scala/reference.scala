object Solution {
  case class Frequency(num: Int, count: Int)

  def topKFrequent(nums: Seq[Int], k: Int): Seq[Int] = {
    implicit val ordering: Ordering[Frequency] = Ordering.by[Frequency, (Int, Int)](entry => (entry.count, -entry.num))
    val counts = nums.groupBy(identity).map { case (num, items) => num -> items.length }
    val heap = scala.collection.mutable.PriorityQueue.empty[Frequency]
    for ((num, count) <- counts) heap.enqueue(Frequency(num, count))
    (0 until math.min(k, counts.size)).map(_ => heap.dequeue().num).sorted
  }
}
