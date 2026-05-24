object Solution {
  def shortestEdgePath(n: Int, edges: Seq[Seq[Int]], start: Int, goal: Int): Int = {
    if (start == goal) return 0
    val graph = Array.fill(n)(scala.collection.mutable.ArrayBuffer.empty[Int])
    for (edge <- edges) {
      val u = edge(0); val v = edge(1)
      graph(u).append(v); graph(v).append(u)
    }
    val queue = scala.collection.mutable.Queue((start, 0))
    val seen = scala.collection.mutable.Set(start)
    while (queue.nonEmpty) {
      val (node, distance) = queue.dequeue()
      for (neighbor <- graph(node)) {
        if (neighbor == goal) return distance + 1
        if (!seen.contains(neighbor)) { seen.add(neighbor); queue.enqueue((neighbor, distance + 1)) }
      }
    }
    -1
  }
}
