object Solution {
  def max_stamp(inputText: String): Long =
    inputText.linesIterator.map(_.trim).filter(_.nonEmpty).map(java.lang.Long.parseLong(_, 36)).foldLeft(-1L)(math.max)
}
