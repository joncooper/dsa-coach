object Solution {
  def moveZeros(nums: Seq[Int]): Seq[Int] = {
    val nonZero = nums.filter(_ != 0)
    nonZero ++ Seq.fill(nums.length - nonZero.length)(0)
  }
}
