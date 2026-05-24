object Solution {
  def subsetSumReachable(nums: Seq[Int], target: Int): Boolean = {
    val reachable = Array.fill(target + 1)(false)
    reachable(0) = true
    for (num <- nums; total <- target to num by -1) reachable(total) = reachable(total) || reachable(total - num)
    reachable(target)
  }
}
