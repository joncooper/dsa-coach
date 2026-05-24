object Solution {
  def dedupeSortedLength(nums: Seq[Int]): Int = {
    if (nums.isEmpty) return 0
    var count = 1
    for (index <- 1 until nums.length) {
      if (nums(index) != nums(index - 1)) count += 1
    }
    count
  }
}
