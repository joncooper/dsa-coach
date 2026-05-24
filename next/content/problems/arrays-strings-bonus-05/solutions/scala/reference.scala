object Solution {
  def mostFrequentCharacter(text: String): Option[String] = {
    if (text.isEmpty) return None
    val counts = scala.collection.mutable.Map.empty[Char, Int].withDefaultValue(0)
    for (char <- text) counts(char) = counts(char) + 1
    var best = text.charAt(0)
    for (char <- text) {
      if (counts(char) > counts(best)) best = char
    }
    Some(best.toString)
  }
}
