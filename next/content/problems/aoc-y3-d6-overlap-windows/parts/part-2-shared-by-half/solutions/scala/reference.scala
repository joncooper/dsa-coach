object Solution {
  def majority_tag_count(inputText: String): Int =
    inputText.split("\n\n").map { block =>
      val counts = scala.collection.mutable.Map.empty[String, Int].withDefaultValue(0)
      var lines = 0

      for (line <- block.linesIterator.map(_.trim).filter(_.nonEmpty)) {
        lines += 1
        for (tag <- line.split(",").filter(_.nonEmpty).toSet) counts(tag) += 1
      }

      if (lines == 0) 0 else {
        val threshold = (lines + 1) / 2
        counts.values.count(_ >= threshold)
      }
    }.sum
}
