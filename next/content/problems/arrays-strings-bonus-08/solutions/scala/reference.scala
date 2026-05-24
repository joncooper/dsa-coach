object Solution {
  def rangeSumQueries(nums: Seq[Int], queries: Seq[Seq[Int]]): Seq[Int] = {
    val prefix = scala.collection.mutable.ArrayBuffer(0)
    for (num <- nums) prefix.append(prefix.last + num)
    queries.map { query =>
      val lo = query(0)
      val hi = query(1)
      prefix(hi + 1) - prefix(lo)
    }
  }
}
