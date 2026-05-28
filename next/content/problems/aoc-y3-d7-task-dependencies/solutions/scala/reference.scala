object Solution {
  def longest_chain(inputText: String): Int = {
    val (children, nodes) = parseTasks(inputText)
    if (nodes.isEmpty) return 0

    val memo = scala.collection.mutable.Map.empty[String, Int]
    def depth(node: String): Int =
      memo.getOrElseUpdate(node, {
        val kids = children.getOrElse(node, Vector.empty)
        if (kids.isEmpty) 1 else 1 + kids.map(depth).max
      })

    nodes.map(depth).max
  }

  private def parseTasks(inputText: String): (Map[String, Vector[String]], Set[String]) = {
    val children = scala.collection.mutable.Map.empty[String, Vector[String]].withDefaultValue(Vector.empty)
    val nodes = scala.collection.mutable.Set.empty[String]

    for (line <- inputText.linesIterator.map(_.trim).filter(line => line.endsWith(".") && line.contains(" before "))) {
      val split = line.dropRight(1).split(" before ", 2)
      val parent = split(0).trim
      nodes += parent
      if (split(1).trim == "nothing") {
        children(parent) = children(parent)
      } else {
        val kids = split(1).split(",").map(_.trim).filter(_.nonEmpty).toVector
        children(parent) = children(parent) ++ kids
        nodes ++= kids
        for (kid <- kids if !children.contains(kid)) children(kid) = Vector.empty
      }
    }

    (children.toMap, nodes.toSet)
  }
}
