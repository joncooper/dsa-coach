object Solution {
  def balancedBracketsLocal(text: String): Boolean = {
    val pairs = Map(')' -> '(', ']' -> '[', '}' -> '{')
    val openers = pairs.values.toSet
    val stack = scala.collection.mutable.ArrayBuffer.empty[Char]
    for (char <- text) {
      if (openers.contains(char)) stack.append(char)
      else if (pairs.contains(char)) {
        if (stack.isEmpty || stack.last != pairs(char)) return false
        stack.remove(stack.length - 1)
      }
    }
    stack.isEmpty
  }
}
