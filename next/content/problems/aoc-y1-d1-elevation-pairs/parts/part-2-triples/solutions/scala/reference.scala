object Solution {
  def elevation_triples(inputText: String): Int = {
    val lines = inputText.linesIterator.map(_.trim).filter(_.nonEmpty).toVector
    if (lines.isEmpty) return 0

    val target = lines.head.toInt
    val values = lines.tail.map(_.toInt)
    var triples = 0

    for (i <- values.indices) {
      val seen = scala.collection.mutable.Map.empty[Int, Int].withDefaultValue(0)
      for (j <- (i + 1) until values.length) {
        triples += seen(target - values(i) - values(j))
        seen(values(j)) += 1
      }
    }

    triples
  }
}
