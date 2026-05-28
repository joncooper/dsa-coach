object Solution {
  def elevation_pairs(inputText: String): Int = {
    val lines = inputText.linesIterator.map(_.trim).filter(_.nonEmpty).toVector
    if (lines.isEmpty) return 0

    val target = lines.head.toInt
    val seen = scala.collection.mutable.Map.empty[Int, Int].withDefaultValue(0)
    var pairs = 0

    for (line <- lines.tail) {
      val value = line.toInt
      pairs += seen(target - value)
      seen(value) += 1
    }

    pairs
  }
}
