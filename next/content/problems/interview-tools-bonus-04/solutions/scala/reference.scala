object Solution {
  def isBalanced(text: String): Boolean = {
    val pairs = Map(')' -> '(', ']' -> '[', '}' -> '{')
    val stack = scala.collection.mutable.ArrayBuffer.empty[Char]
    for (ch <- text) { if (pairs.contains(ch)) { if (stack.isEmpty || stack.remove(stack.length - 1) != pairs(ch)) return false } else stack.append(ch) }
    stack.isEmpty
  }
}
