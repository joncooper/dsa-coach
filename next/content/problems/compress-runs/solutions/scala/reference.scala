object Solution {
  def compressRuns(text: String): String = {
    if (text.isEmpty) return ""
    val builder = new StringBuilder
    var active = text.charAt(0)
    var count = 1
    for (index <- 1 until text.length) {
      val char = text.charAt(index)
      if (char == active) {
        count += 1
      } else {
        builder.append(active).append(count)
        active = char
        count = 1
      }
    }
    builder.append(active).append(count)
    builder.toString
  }
}
