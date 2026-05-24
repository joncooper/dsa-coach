object Solution {
  def containsDuplicateWithinK(nums: Seq[Int], k: Int): Boolean = {
    val lastSeen = scala.collection.mutable.Map.empty[Int, Int]
    for ((num, index) <- nums.zipWithIndex) {
      lastSeen.get(num).foreach { previous =>
        if (index - previous <= k) return true
      }
      lastSeen(num) = index
    }
    false
  }
}
