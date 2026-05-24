object Solution {
  def countReachable(graph: Map[String, Seq[String]], source: String): Int = {
    val seen = scala.collection.mutable.Set(source)
    val queue = scala.collection.mutable.Queue(source)
    while (queue.nonEmpty) {
      val node = queue.dequeue()
      for (neighbor <- graph.getOrElse(node, Seq.empty)) {
        if (!seen.contains(neighbor)) { seen.add(neighbor); queue.enqueue(neighbor) }
      }
    }
    seen.size
  }
}
