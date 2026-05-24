object Solution {
  def insertAfterIndex(values: Seq[Int], index: Int, value: Int): Seq[Int] = {
    if (index < 0 || index >= values.length) values
    else values.take(index + 1) ++ Seq(value) ++ values.drop(index + 1)
  }
}
