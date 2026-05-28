object Solution {
  def schedule_finish(inputText: String): Int = {
    val (children, nodes) = parseTasks(inputText)
    if (nodes.isEmpty) return 0

    val parents = scala.collection.mutable.Map.empty[String, scala.collection.mutable.Set[String]]
    for (node <- nodes) parents(node) = scala.collection.mutable.Set.empty[String]
    for ((parent, kids) <- children; kid <- kids) parents.getOrElseUpdate(kid, scala.collection.mutable.Set.empty) += parent

    val starts = scala.collection.mutable.Map.empty[String, Int]
    def startTime(node: String): Int =
      starts.getOrElseUpdate(node, {
        val predecessors = parents.getOrElse(node, Set.empty[String]).toVector
        if (predecessors.isEmpty) 0 else predecessors.map(startTime).max + 1
      })

    nodes.map(startTime).max + 1
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
