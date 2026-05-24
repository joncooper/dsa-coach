object Solution {
  def countDistinctPairSums(nums: Seq[Int]): Int = {
    val sums = scala.collection.mutable.Set.empty[Int]
    for (left <- nums.indices) {
      for (right <- left + 1 until nums.length) sums.add(nums(left) + nums(right))
    }
    sums.size
  }
}
