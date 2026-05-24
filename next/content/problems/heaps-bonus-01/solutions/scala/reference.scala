object Solution {
  def kthLargest(nums: Seq[Int], k: Int): Int = {
    nums.sorted(Ordering.Int.reverse)(k - 1)
  }
}
