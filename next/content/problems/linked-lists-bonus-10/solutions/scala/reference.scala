object Solution {
  def swapPairs(values: Seq[Int]): Seq[Int] = {
    val result = values.toArray
    for (index <- 0 until result.length - 1 by 2) {
      val temp = result(index)
      result(index) = result(index + 1)
      result(index + 1) = temp
    }
    result.toSeq
  }
}
