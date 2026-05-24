object Solution {
  def sortedSquaresLocal(nums: Seq[Int]): Seq[Int] = {
    val result = Array.fill(nums.length)(0)
    var left = 0
    var right = nums.length - 1
    for (write <- nums.indices.reverse) {
      val leftSquare = nums(left) * nums(left)
      val rightSquare = nums(right) * nums(right)
      if (leftSquare > rightSquare) {
        result(write) = leftSquare
        left += 1
      } else {
        result(write) = rightSquare
        right -= 1
      }
    }
    result.toSeq
  }
}
