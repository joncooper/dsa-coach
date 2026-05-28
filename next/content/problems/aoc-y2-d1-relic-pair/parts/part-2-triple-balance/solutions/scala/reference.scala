object Solution {
  def balanced_triple_count(inputText: String): Int = {
    val counts = scala.collection.mutable.Map.empty[Int, Int].withDefaultValue(0)
    for (line <- inputText.linesIterator.map(_.trim).filter(_.nonEmpty)) counts(line.toInt) += 1
    counts.values.map(count => count * (count - 1) * (count - 2) / 6).sum
  }
}
