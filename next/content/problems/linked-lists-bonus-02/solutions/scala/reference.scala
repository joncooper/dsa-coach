object Solution {
  def valueAtIndex(values: Seq[Int], index: Int): Any = {
    if (index < 0 || index >= values.length) null else values(index)
  }
}
