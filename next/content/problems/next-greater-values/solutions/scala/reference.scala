object Solution {
  def nextGreaterValues(nums: Seq[Int]): Seq[Int] = {
    val result = Array.fill(nums.length)(-1)
    val stack = scala.collection.mutable.ArrayBuffer.empty[Int]
    for (index <- nums.indices) {
      while (stack.nonEmpty && nums(index) > nums(stack.last)) {
        result(stack.remove(stack.length - 1)) = nums(index)
      }
      stack.append(index)
    }
    result.toSeq
  }
}
