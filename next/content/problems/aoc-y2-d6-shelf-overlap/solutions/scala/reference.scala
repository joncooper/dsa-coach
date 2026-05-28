object Solution {
  def shelf_overlap(inputText: String): Int =
    inputText.split("\n\n").map { block =>
      val shelves = block.linesIterator.map(_.trim).filter(_.nonEmpty).map(parseSet).toVector
      if (shelves.isEmpty) 0 else shelves.reduce(_ intersect _).size
    }.sum

  private def parseSet(line: String): Set[Int] =
    line.split(",").filter(_.nonEmpty).map(_.toInt).toSet
}
