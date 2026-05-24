object Solution {
  def kClosestNumbers(nums: Seq[Int], target: Int, k: Int): Seq[Int] = {
    nums.sortBy(num => (math.abs(num - target), num)).take(k).sorted
  }
}
