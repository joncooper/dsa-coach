object Solution {
  def shelf_unique(inputText: String): Int =
    inputText.split("\n\n").map { block =>
      val counts = scala.collection.mutable.Map.empty[Int, Int].withDefaultValue(0)
      var sawShelf = false
      for (line <- block.linesIterator.map(_.trim).filter(_.nonEmpty)) {
        sawShelf = true
        for (id <- line.split(",").filter(_.nonEmpty).map(_.toInt).toSet) counts(id) += 1
      }
      if (sawShelf) counts.values.count(_ == 1) else 0
    }.sum
}
