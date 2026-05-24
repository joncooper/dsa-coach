object Solution {
  def charFrequencyTable(text: String): Map[String, Int] = {
    val counts = scala.collection.mutable.Map.empty[String, Int].withDefaultValue(0)
    for (char <- text) {
      val key = char.toString
      counts(key) = counts(key) + 1
    }
    counts.toMap
  }
}
