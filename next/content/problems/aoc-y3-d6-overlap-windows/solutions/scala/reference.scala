object Solution {
  def odd_tag_count(inputText: String): Int =
    inputText.split("\n\n").map { block =>
      val counts = scala.collection.mutable.Map.empty[String, Int].withDefaultValue(0)
      var sawLine = false

      for (line <- block.linesIterator.map(_.trim).filter(_.nonEmpty)) {
        sawLine = true
        for (tag <- line.split(",").filter(_.nonEmpty).toSet) counts(tag) += 1
      }

      if (sawLine) counts.values.count(_ % 2 == 1) else 0
    }.sum
}
