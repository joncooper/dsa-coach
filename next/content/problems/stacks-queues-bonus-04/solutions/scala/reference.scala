object Solution {
  def parenScore(text: String): Int = {
    val stack = scala.collection.mutable.ArrayBuffer(0)
    for (char <- text) {
      if (char == '(') stack.append(0)
      else {
        val inside = stack.remove(stack.length - 1)
        stack(stack.length - 1) += math.max(1, inside * 2)
      }
    }
    stack.head
  }
}
