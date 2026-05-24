object Solution {
  def isListSorted(values: Seq[Int]): Boolean = {
    for (index <- 1 until values.length) {
      if (values(index - 1) > values(index)) return false
    }
    true
  }
}
