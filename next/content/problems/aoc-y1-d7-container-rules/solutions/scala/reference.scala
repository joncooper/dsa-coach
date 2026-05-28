object Solution {
  private case class Child(count: Int, color: String)
  private val Rule = raw"(\w+ \w+) containers hold (.+)\.".r
  private val ChildRule = raw"(\d+) (\w+ \w+) containers?".r

  def count_containers_holding_gold(inputText: String): Int = {
    val contains = parseContainers(inputText)
    val parents = scala.collection.mutable.Map.empty[String, scala.collection.mutable.ArrayBuffer[String]]

    for ((parent, children) <- contains; child <- children) {
      parents.getOrElseUpdate(child.color, scala.collection.mutable.ArrayBuffer.empty) += parent
    }

    val seen = scala.collection.mutable.Set.empty[String]
    val stack = scala.collection.mutable.Stack.from(parents.getOrElse("bright gold", Seq.empty))

    while (stack.nonEmpty) {
      val color = stack.pop()
      if (!seen(color)) {
        seen += color
        stack.pushAll(parents.getOrElse(color, Seq.empty))
      }
    }

    seen.size
  }

  private def parseContainers(inputText: String): Map[String, Vector[Child]] =
    inputText.linesIterator.map(_.trim).filter(_.nonEmpty).flatMap {
      case Rule(parent, "no other containers") => Some(parent -> Vector.empty[Child])
      case Rule(parent, childrenText) =>
        val children = ChildRule.findAllMatchIn(childrenText).map { m =>
          Child(m.group(1).toInt, m.group(2))
        }.toVector
        Some(parent -> children)
      case _ => None
    }.toMap
}
