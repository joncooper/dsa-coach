object Solution {
  def decodeString(text: String): String = {
    val counts = scala.collection.mutable.ArrayBuffer.empty[Int]
    val pieces = scala.collection.mutable.ArrayBuffer.empty[String]
    var current = ""
    var count = 0
    for (char <- text) {
      if (char.isDigit) count = count * 10 + char.asDigit
      else if (char == '[') {
        counts.append(count)
        pieces.append(current)
        current = ""
        count = 0
      } else if (char == ']') {
        val repeat = counts.remove(counts.length - 1)
        current = pieces.remove(pieces.length - 1) + current * repeat
      } else current += char
    }
    current
  }
}
