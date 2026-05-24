object Solution {
  def sumEvenIndices(nums: Seq[Int]): Int = {
    (0 until nums.length by 2).map(index => nums(index)).sum
  }
}
