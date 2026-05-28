object Solution {
  def topKScores(scores: Seq[Int], k: Int): Seq[Int] = {
    if (k <= 0) return Seq.empty
    val limit = math.min(k, scores.length)
    val heap = scala.collection.mutable.PriorityQueue.empty[Int](Ordering.Int.reverse)
    for (score <- scores) {
      if (heap.size < limit) heap.enqueue(score)
      else if (score > heap.head) { heap.dequeue(); heap.enqueue(score) }
    }
    heap.dequeueAll.reverse
  }
}
