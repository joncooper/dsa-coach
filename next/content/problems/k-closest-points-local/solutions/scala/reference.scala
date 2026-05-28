object Solution {
  case class PointEntry(distance: Int, x: Int, y: Int, point: Seq[Int])

  def kClosestPointsLocal(points: Seq[Seq[Int]], k: Int): Seq[Seq[Int]] = {
    implicit val ordering: Ordering[PointEntry] = Ordering.by[PointEntry, (Int, Int, Int)](entry => (entry.distance, entry.x, entry.y)).reverse
    val heap = scala.collection.mutable.PriorityQueue.empty[PointEntry]
    for (point <- points) {
      val x = point(0); val y = point(1)
      heap.enqueue(PointEntry(x * x + y * y, x, y, point))
    }
    (0 until math.min(k, points.length)).map(_ => heap.dequeue().point)
  }
}
