object Solution {
  def firstNegativeIndex(nums: Seq[Int]): Int = {
    nums.indexWhere(_ < 0)
  }
}
