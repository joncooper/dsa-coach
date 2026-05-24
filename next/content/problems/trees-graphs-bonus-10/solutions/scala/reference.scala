object Solution {
  def hasRoute(graph: Map[String, Seq[String]], source: String, target: String): Boolean = {
    if (source == target) return true
    val seen = scala.collection.mutable.Set(source)
    val stack = scala.collection.mutable.Stack(source)
    while (stack.nonEmpty) {
      val node = stack.pop()
      for (neighbor <- graph.getOrElse(node, Seq.empty)) {
        if (neighbor == target) return true
        if (!seen.contains(neighbor)) { seen.add(neighbor); stack.push(neighbor) }
      }
    }
    false
  }
}
