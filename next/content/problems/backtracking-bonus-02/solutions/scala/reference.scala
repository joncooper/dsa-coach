object Solution {
  def letterCaseCombinations(text: String): Seq[String] = {
    val result = scala.collection.mutable.ArrayBuffer.empty[String]
    val chars = scala.collection.mutable.ArrayBuffer.empty[Char]
    def backtrack(index: Int): Unit = {
      if (index == text.length) { result.append(chars.mkString); return }
      val ch = text(index)
      if (ch.isLetter) { chars.append(ch.toLower); backtrack(index + 1); chars.remove(chars.length - 1); chars.append(ch.toUpper); backtrack(index + 1); chars.remove(chars.length - 1) }
      else { chars.append(ch); backtrack(index + 1); chars.remove(chars.length - 1) }
    }
    backtrack(0)
    result.toSeq.sorted
  }
}
