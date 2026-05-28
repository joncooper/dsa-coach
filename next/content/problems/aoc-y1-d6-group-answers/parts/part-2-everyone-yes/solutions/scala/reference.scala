object Solution {
  def everyone_yes_sum(inputText: String): Int =
    inputText.split("\n\n").map { block =>
      val people = block.linesIterator.map(_.trim).filter(_.nonEmpty).toVector
      if (people.isEmpty) 0 else people.map(_.toSet).reduce(_ intersect _).size
    }.sum
}
