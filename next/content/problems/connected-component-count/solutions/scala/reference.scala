object Solution {
  def connectedComponentCount(n: Int, edges: Seq[Seq[Int]]): Int = {
    val graph = Array.fill(n)(scala.collection.mutable.ArrayBuffer.empty[Int])
    for (edge <- edges) {
      val u = edge(0); val v = edge(1)
      if (u != v) { graph(u).append(v); graph(v).append(u) }
    }
    val seen = scala.collection.mutable.Set.empty[Int]
    var components = 0
    for (node <- 0 until n) {
      if (!seen.contains(node)) {
        components += 1
        val stack = scala.collection.mutable.Stack(node)
        seen.add(node)
        while (stack.nonEmpty) {
          val current = stack.pop()
          for (neighbor <- graph(current)) if (!seen.contains(neighbor)) { seen.add(neighbor); stack.push(neighbor) }
        }
      }
    }
    components
  }
}
