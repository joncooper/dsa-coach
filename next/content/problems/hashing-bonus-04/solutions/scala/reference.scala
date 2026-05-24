object Solution {
  def twoSumExists(nums: Seq[Int], target: Int): Boolean = {
    val seen = scala.collection.mutable.Set.empty[Int]
    for (num <- nums) {
      if (seen.contains(target - num)) return true
      seen.add(num)
    }
    false
  }
}
