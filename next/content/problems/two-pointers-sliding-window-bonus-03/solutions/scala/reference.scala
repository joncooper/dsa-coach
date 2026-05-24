object Solution {
  def removeElement(nums: Seq[Int], value: Int): Int = {
    nums.count(_ != value)
  }
}
