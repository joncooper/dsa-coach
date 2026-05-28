object Solution {
  def max_block_sum(inputText: String): Int =
    inputText.split("\n\n").map(blockSum).foldLeft(0)(math.max)

  private def blockSum(block: String): Int =
    block.linesIterator.map(_.trim).filter(_.contains("=")).map { line =>
      val value = line.substring(line.indexOf('=') + 1).trim
      if (value.forall(_.isDigit)) value.toInt else 0
    }.sum
}
