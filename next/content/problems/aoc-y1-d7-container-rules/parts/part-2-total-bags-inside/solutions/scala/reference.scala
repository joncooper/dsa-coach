object Solution {
  private case class Child(count: Int, color: String)
  private val Rule = raw"(\w+ \w+) containers hold (.+)\.".r
  private val ChildRule = raw"(\d+) (\w+ \w+) containers?".r

  def total_inside_gold(inputText: String): Int = {
    val contains = parseContainers(inputText)
    val memo = scala.collection.mutable.Map.empty[String, Int]

    def total(color: String): Int =
      memo.getOrElseUpdate(color, contains.getOrElse(color, Vector.empty).map { child =>
        child.count + child.count * total(child.color)
      }.sum)

    total("bright gold")
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
