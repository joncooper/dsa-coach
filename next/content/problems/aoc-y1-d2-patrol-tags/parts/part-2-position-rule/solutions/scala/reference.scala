object Solution {
  def count_valid_positions(inputText: String): Int = {
    var valid = 0

    for (line <- inputText.linesIterator.map(_.trim).filter(_.nonEmpty)) {
      val space = line.indexOf(' ')
      val Array(firstText, secondText) = line.substring(0, space).split("-", 2)
      val rest = line.substring(space + 1)
      val Array(charText, word) = rest.split(": ", 2)
      val target = charText.head
      val first = matches(word, firstText.toInt - 1, target)
      val second = matches(word, secondText.toInt - 1, target)
      if (first != second) valid += 1
    }

    valid
  }

  private def matches(word: String, index: Int, target: Char): Boolean =
    index >= 0 && index < word.length && word.charAt(index) == target
}
