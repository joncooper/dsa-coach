object Solution {
  def treeMaxDepthLocal(values: Seq[Any]): Int = {
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
    def depth(node: Option[Node]): Int = node match {
      case None => 0
      case Some(current) => 1 + math.max(depth(current.left), depth(current.right))
    }
    depth(root)
  }
}
