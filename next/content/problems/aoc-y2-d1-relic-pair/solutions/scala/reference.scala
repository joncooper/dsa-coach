object Solution {
  def balanced_pair_count(inputText: String): Int = {
    val counts = valueCounts(inputText)
    counts.values.map(count => count * (count - 1) / 2).sum
  }

  private def valueCounts(inputText: String): Map[Int, Int] = {
    val counts = scala.collection.mutable.Map.empty[Int, Int].withDefaultValue(0)
    for (line <- inputText.linesIterator.map(_.trim).filter(_.nonEmpty)) counts(line.toInt) += 1
    counts.toMap
  }
}
