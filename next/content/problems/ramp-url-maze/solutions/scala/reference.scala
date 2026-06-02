import scala.collection.mutable

object Solution {
  def findFinalUrl(startUrl: String, maxRetries: Int): Option[String] = {
    val queue = mutable.Queue[String](startUrl)
    val seen = mutable.Set[String](startUrl)

    while (queue.nonEmpty) {
      val url = queue.dequeue()
      val response = readWithRetries(url, maxRetries)

      if (response == "congrats") return Some(url)

      response match {
        case body: Map[_, _] =>
          body.asInstanceOf[Map[String, Any]].get("urls") match {
            case Some(urls: Seq[_]) =>
              for (next <- urls) {
                next match {
                  case nextUrl: String if !seen.contains(nextUrl) =>
                    seen += nextUrl
                    queue.enqueue(nextUrl)
                  case _ =>
                }
              }
            case _ =>
          }
        case _ =>
      }
    }

    None
  }

  private def readWithRetries(url: String, maxRetries: Int): Any = {
    for (attempt <- 0 to maxRetries) {
      val response = MazeApi.fetchUrl(url)
      if (status(response).contains(503)) {
        if (attempt == maxRetries) return null
      } else {
        return response
      }
    }
    null
  }

  private def status(response: Any): Option[Int] = response match {
    case body: Map[_, _] =>
      body.asInstanceOf[Map[String, Any]].get("status") match {
        case Some(code: Int) => Some(code)
        case Some(code: Long) => Some(code.toInt)
        case Some(code: Double) => Some(code.toInt)
        case _ => None
      }
    case _ => None
  }
}
