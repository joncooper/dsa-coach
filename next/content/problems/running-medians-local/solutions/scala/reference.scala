object Solution {
  def runningMediansLocal(nums: Seq[Int]): Seq[Double] = {
    val lower = scala.collection.mutable.PriorityQueue.empty[Int]
    val upper = scala.collection.mutable.PriorityQueue.empty[Int](Ordering.Int.reverse)
    val medians = scala.collection.mutable.ArrayBuffer.empty[Double]

    for (num <- nums) {
      if (lower.isEmpty || num <= lower.head) lower.enqueue(num) else upper.enqueue(num)
      if (lower.size > upper.size + 1) upper.enqueue(lower.dequeue())
      else if (upper.size > lower.size) lower.enqueue(upper.dequeue())

      if ((lower.size + upper.size) % 2 == 1) medians.append(lower.head.toDouble)
      else medians.append((lower.head + upper.head).toDouble / 2.0)
    }
    medians.toSeq
  }
}
