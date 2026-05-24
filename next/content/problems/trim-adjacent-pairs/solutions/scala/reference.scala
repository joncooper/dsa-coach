object Solution {
  def trimAdjacentPairs(text: String): String = {
    val stack = scala.collection.mutable.ArrayBuffer.empty[Char]
    for (char <- text) {
      if (stack.nonEmpty && stack.last == char) stack.remove(stack.length - 1)
      else stack.append(char)
    }
    stack.mkString
  }
}
