object Solution {
  def sortBinaryArray(bits: Seq[Int]): Seq[Int] = {
    val result = bits.toArray
    var left = 0
    var right = result.length - 1
    while (left < right) {
      while (left < right && result(left) == 0) left += 1
      while (left < right && result(right) == 1) right -= 1
      if (left < right) {
        result(left) = 0
        result(right) = 1
      }
    }
    result.toSeq
  }
}
