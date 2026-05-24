object Solution {
  def plusOne(digits: Seq[Int]): Seq[Int] = {
    val result = digits.toBuffer
    var carry = 1
    var index = result.length - 1
    while (index >= 0 && carry > 0) {
      val value = result(index) + carry
      result(index) = value % 10
      carry = value / 10
      index -= 1
    }
    if (carry > 0) carry +: result.toSeq else result.toSeq
  }
}
