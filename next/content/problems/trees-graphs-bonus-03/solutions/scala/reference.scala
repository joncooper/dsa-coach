object Solution {
  def treeMinimum(values: Seq[Any]): Any = {
    case class Node(value: Int, var left: Option[Node] = None, var right: Option[Node] = None)
    def asInt(value: Any): Int = value.asInstanceOf[Int]
    def buildTree(items: Seq[Any]): Option[Node] = {
      if (items.isEmpty || items.head == null) return None
      val root = Node(asInt(items.head))
      val queue = scala.collection.mutable.Queue(root)
      var index = 1
      while (index < items.length && queue.nonEmpty) {
        val node = queue.dequeue()
        val left = items(index)
        index += 1
        if (left != null) { node.left = Some(Node(asInt(left))); queue.enqueue(node.left.get) }
        if (index < items.length) {
          val right = items(index)
          index += 1
          if (right != null) { node.right = Some(Node(asInt(right))); queue.enqueue(node.right.get) }
        }
      }
      Some(root)
    }
    val root = buildTree(values)
    root match {
      case None => null
      case Some(start) =>
        var best = start.value
        val stack = scala.collection.mutable.Stack(start)
        while (stack.nonEmpty) {
          val node = stack.pop()
          best = math.min(best, node.value)
          node.left.foreach(stack.push(_))
          node.right.foreach(stack.push(_))
        }
        best
    }
  }
}
