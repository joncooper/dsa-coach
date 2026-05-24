object Solution {
  def keypadLetterWords(digits: String): Seq[String] = {
    val mapping = Map('2' -> "abc", '3' -> "def", '4' -> "ghi", '5' -> "jkl", '6' -> "mno", '7' -> "pqrs", '8' -> "tuv", '9' -> "wxyz")
    if (digits.isEmpty || digits.exists(digit => !mapping.contains(digit))) return Seq.empty
    val result = scala.collection.mutable.ArrayBuffer.empty[String]
    val letters = scala.collection.mutable.ArrayBuffer.empty[Char]
    def backtrack(index: Int): Unit = {
      if (index == digits.length) { result.append(letters.mkString); return }
      for (letter <- mapping(digits(index))) { letters.append(letter); backtrack(index + 1); letters.remove(letters.length - 1) }
    }
    backtrack(0)
    result.toSeq.sorted
  }
}
