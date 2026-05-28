object Solution {
  def valid_roster_total(inputText: String): Int = {
    val required = Set("food", "craft", "music")

    inputText.split("\n\n").map { block =>
      val categories = scala.collection.mutable.Set.empty[String]
      var itemCount = 0

      for (line <- block.linesIterator.map(_.trim).filter(_.contains(":"))) {
        val Array(category, items) = line.split(":", 2)
        categories += category
        itemCount += items.split(",").length
      }

      if (required.subsetOf(categories.toSet)) itemCount else 0
    }.sum
  }
}
