object Solution {
  def minStackOps(ops: Seq[Seq[Any]]): Seq[Int] = {
    val stack = scala.collection.mutable.ArrayBuffer.empty[Int]
    val mins = scala.collection.mutable.ArrayBuffer.empty[Int]
    val answers = scala.collection.mutable.ArrayBuffer.empty[Int]
    for (op <- ops) {
      op.head.asInstanceOf[String] match {
        case "push" =>
          val value = op(1).asInstanceOf[Int]
          stack.append(value)
          mins.append(if (mins.isEmpty) value else math.min(value, mins.last))
        case "pop" =>
          if (stack.nonEmpty) {
            stack.remove(stack.length - 1)
            mins.remove(mins.length - 1)
          }
        case "min" =>
          if (mins.nonEmpty) answers.append(mins.last)
        case _ =>
      }
    }
    answers.toSeq
  }
}
