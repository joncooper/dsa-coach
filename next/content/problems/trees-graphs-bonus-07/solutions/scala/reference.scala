object Solution {
  def isSymmetric(values: Seq[Any]): Boolean = {
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
    def mirror(left: Option[Node], right: Option[Node]): Boolean = (left, right) match {
      case (None, None) => true
      case (Some(a), Some(b)) => a.value == b.value && mirror(a.left, b.right) && mirror(a.right, b.left)
      case _ => false
    }
    root.isEmpty || mirror(root.get.left, root.get.right)
  }
}
