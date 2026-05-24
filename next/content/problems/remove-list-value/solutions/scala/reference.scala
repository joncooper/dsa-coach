object Solution {
  def removeListValue(values: Seq[Int], target: Int): Any = {
    val result = values.filter(_ != target)
    if (values.length == 1 && result.isEmpty) null else result
  }
}
