object Solution {
  def firstUniqueIndex(text: String): Int = {
    val counts = scala.collection.mutable.Map.empty[Char, Int].withDefaultValue(0)
    for (char <- text) counts(char) = counts(char) + 1
    for (index <- text.indices) {
      if (counts(text.charAt(index)) == 1) return index
    }
    -1
  }
}
