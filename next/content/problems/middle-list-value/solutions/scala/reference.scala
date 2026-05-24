object Solution {
  def middleListValue(values: Seq[Int]): Any = {
    if (values.isEmpty) null else values(values.length / 2)
  }
}
