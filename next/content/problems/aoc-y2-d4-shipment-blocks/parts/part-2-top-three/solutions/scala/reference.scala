object Solution {
  def top_three_block_sum(inputText: String): Int =
    inputText.split("\n\n").map(blockSum).sorted(Ordering.Int.reverse).take(3).sum

  private def blockSum(block: String): Int =
    block.linesIterator.map(_.trim).filter(_.contains("=")).map { line =>
      val value = line.substring(line.indexOf('=') + 1).trim
      if (value.forall(_.isDigit)) value.toInt else 0
    }.sum
}
