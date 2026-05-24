object Solution {
  def canFormWord(word: String, letters: Seq[String]): Boolean = {
    val counts = scala.collection.mutable.Map.empty[Char, Int].withDefaultValue(0)
    for (letter <- letters if letter.nonEmpty) counts(letter.charAt(0)) = counts(letter.charAt(0)) + 1
    for (char <- word) {
      if (counts(char) == 0) return false
      counts(char) = counts(char) - 1
    }
    true
  }
}
