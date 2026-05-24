object Solution {
  def topKFrequent(nums: Seq[Int], k: Int): Seq[Int] = {
    val counts = nums.groupBy(identity).map { case (num, items) => num -> items.length }
    counts.toSeq.sortBy { case (num, count) => (-count, num) }.take(k).map(_._1).sorted
  }
}
