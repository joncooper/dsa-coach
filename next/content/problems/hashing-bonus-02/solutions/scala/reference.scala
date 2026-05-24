object Solution {
  def mostFrequentValue(values: Seq[Int]): Option[Int] = {
    if (values.isEmpty) return None
    val counts = scala.collection.mutable.Map.empty[Int, Int].withDefaultValue(0)
    for (value <- values) counts(value) = counts(value) + 1
    var best = values.head
    for (value <- values) {
      if (counts(value) > counts(best)) best = value
    }
    Some(best)
  }
}
