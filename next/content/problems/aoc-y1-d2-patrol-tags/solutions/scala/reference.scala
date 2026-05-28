object Solution {
  def count_valid_tags(inputText: String): Int = {
    var valid = 0

    for (line <- inputText.linesIterator.map(_.trim).filter(_.nonEmpty)) {
      val space = line.indexOf(' ')
      val Array(lowText, highText) = line.substring(0, space).split("-", 2)
      val rest = line.substring(space + 1)
      val Array(charText, word) = rest.split(": ", 2)
      val count = word.count(_ == charText.head)
      if (lowText.toInt <= count && count <= highText.toInt) valid += 1
    }

    valid
  }
}
