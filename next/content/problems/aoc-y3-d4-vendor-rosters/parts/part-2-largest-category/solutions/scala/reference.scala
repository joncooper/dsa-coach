object Solution {
  def heaviest_category(inputText: String): String = {
    val required = Set("food", "craft", "music")
    val totals = scala.collection.mutable.Map.empty[String, Int].withDefaultValue(0)

    for (block <- inputText.split("\n\n")) {
      val categories = scala.collection.mutable.Set.empty[String]
      val perRoster = scala.collection.mutable.Map.empty[String, Int].withDefaultValue(0)

      for (line <- block.linesIterator.map(_.trim).filter(_.contains(":"))) {
        val Array(category, items) = line.split(":", 2)
        categories += category
        perRoster(category) += items.split(",").length
      }

      if (required.subsetOf(categories.toSet)) {
        for ((category, count) <- perRoster) totals(category) += count
      }
    }

    totals.keys.toVector.sorted.foldLeft(("", -1)) { case ((bestCategory, bestCount), category) =>
      val count = totals(category)
      if (count > bestCount) (category, count) else (bestCategory, bestCount)
    }._1
  }
}
