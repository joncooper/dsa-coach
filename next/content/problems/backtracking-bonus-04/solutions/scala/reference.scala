object Solution {
  def canPartitionKSubsets(nums: Seq[Int], k: Int): Boolean = {
    val total = nums.sum
    if (k <= 0 || total % k != 0) return false
    val target = total / k
    val ordered = nums.sorted(Ordering.Int.reverse)
    if (ordered.nonEmpty && ordered.head > target) return false
    val buckets = Array.fill(k)(0)
    def backtrack(index: Int): Boolean = {
      if (index == ordered.length) return true
      val seen = scala.collection.mutable.Set.empty[Int]
      for (bucket <- 0 until k) {
        if (!seen.contains(buckets(bucket)) && buckets(bucket) + ordered(index) <= target) {
          seen.add(buckets(bucket)); buckets(bucket) += ordered(index)
          if (backtrack(index + 1)) return true
          buckets(bucket) -= ordered(index)
        }
        if (buckets(bucket) == 0) return false
      }
      false
    }
    backtrack(0)
  }
}
