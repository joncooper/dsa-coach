object Solution {
  def removeNthFromEnd(values: Seq[Int], n: Int): Seq[Int] = {
    val index = values.length - n
    if (index < 0 || index >= values.length) values
    else values.take(index) ++ values.drop(index + 1)
  }
}
