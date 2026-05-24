object Solution {
  def kClosestPointsLocal(points: Seq[Seq[Int]], k: Int): Seq[Seq[Int]] = {
    points.sortBy(point => (point(0) * point(0) + point(1) * point(1), point(0), point(1))).take(k)
  }
}
