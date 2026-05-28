object Solution {
  def anyone_yes_sum(inputText: String): Int =
    inputText.split("\n\n").map { block =>
      block.linesIterator.flatMap(_.trim).toSet.size
    }.sum
}
