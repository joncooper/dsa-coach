object Solution {
  case class Entry(value: Int, batch: Int, index: Int)

  def mergeSortedBatches(batches: Seq[Seq[Int]]): Seq[Int] = {
    implicit val ordering: Ordering[Entry] = Ordering.by[Entry, (Int, Int, Int)](entry => (entry.value, entry.batch, entry.index)).reverse
    val heap = scala.collection.mutable.PriorityQueue.empty[Entry]
    for ((batch, batchIndex) <- batches.zipWithIndex if batch.nonEmpty) heap.enqueue(Entry(batch.head, batchIndex, 0))

    val merged = scala.collection.mutable.ArrayBuffer.empty[Int]
    while (heap.nonEmpty) {
      val next = heap.dequeue()
      merged.append(next.value)
      val index = next.index + 1
      if (index < batches(next.batch).length) heap.enqueue(Entry(batches(next.batch)(index), next.batch, index))
    }
    merged.toSeq
  }
}
