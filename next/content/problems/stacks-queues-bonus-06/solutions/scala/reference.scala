object Solution {
  def validateStackSequence(pushed: Seq[Int], popped: Seq[Int]): Boolean = {
    val stack = scala.collection.mutable.ArrayBuffer.empty[Int]
    var popIndex = 0
    for (value <- pushed) {
      stack.append(value)
      while (stack.nonEmpty && popIndex < popped.length && stack.last == popped(popIndex)) {
        stack.remove(stack.length - 1)
        popIndex += 1
      }
    }
    popIndex == popped.length
  }
}
