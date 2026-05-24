object Solution {
  def isSortedAscending(nums: Seq[Int]): Boolean = {
    for (index <- 1 until nums.length) {
      if (nums(index) < nums(index - 1)) return false
    }
    true
  }
}
