object Solution {
  def missingNumber(nums: Seq[Int]): Int = {
    val seen = nums.toSet
    for (candidate <- 0 to nums.length) {
      if (!seen.contains(candidate)) return candidate
    }
    nums.length
  }
}
