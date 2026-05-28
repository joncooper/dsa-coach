object Solution {
  case class JobEntry(priority: Int, id: Int)

  def printOrder(jobs: Seq[Seq[Int]]): Seq[Int] = {
    implicit val ordering: Ordering[JobEntry] = Ordering.by[JobEntry, (Int, Int)](entry => (entry.priority, -entry.id))
    val heap = scala.collection.mutable.PriorityQueue.empty[JobEntry]
    for (job <- jobs) heap.enqueue(JobEntry(job(0), job(1)))
    heap.dequeueAll.map(_.id)
  }
}
