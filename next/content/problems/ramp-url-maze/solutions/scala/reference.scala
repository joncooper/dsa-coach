import scala.collection.mutable

object Solution {
  private case class Page(kind: String, payload: Any, failures: Int)

  def findExitUrl(pages: Seq[Seq[Any]], start: String, maxRetries: Int): String = {
    val byUrl = mutable.Map[String, Page]()
    for (row <- pages) {
      byUrl(row(0).toString) = Page(row(1).toString, row(2), asInt(row(3)))
    }

    val queue = mutable.Queue[String](start)
    val visited = mutable.Set[String]()
    val attempts = mutable.Map[String, Int]().withDefaultValue(0)

    while (queue.nonEmpty) {
      val url = queue.dequeue()
      if (!visited.contains(url)) {
        byUrl.get(url) match {
          case None =>
          case Some(page) =>
            val attempt = attempts(url)
            if (attempt < page.failures) {
              attempts(url) = attempt + 1
              if (attempts(url) <= maxRetries) queue.enqueue(url)
            } else {
              visited += url
              if (page.kind == "EXIT") return url
              if (page.kind == "LINKS") {
                for (nextUrl <- asSeq(page.payload)) {
                  val child = nextUrl.toString
                  if (!visited.contains(child)) queue.enqueue(child)
                }
              }
            }
        }
      }
    }

    ""
  }

  private def asSeq(value: Any): Seq[Any] = value match {
    case items: Seq[_] => items.asInstanceOf[Seq[Any]]
    case _ => Seq.empty
  }

  private def asInt(value: Any): Int = value match {
    case n: Int => n
    case n: Long => n.toInt
    case n: Double => n.toInt
    case text: String => text.toInt
    case _ => 0
  }
}
