object Solution {
  def hasCycle(graph: Map[String, Seq[String]]): Boolean = {
    val visiting = scala.collection.mutable.Set.empty[String]
    val visited = scala.collection.mutable.Set.empty[String]
    def dfs(node: String): Boolean = {
      if (visiting.contains(node)) return true
      if (visited.contains(node)) return false
      visiting.add(node)
      for (neighbor <- graph.getOrElse(node, Seq.empty)) if (dfs(neighbor)) return true
      visiting.remove(node)
      visited.add(node)
      false
    }
    graph.keys.exists(dfs)
  }
}
