import scala.collection.mutable

object Solution {
  def findFinalUrl(startUrl: String, maxRetries: Int): Option[String] = {
    val queue = mutable.Queue[String](startUrl)
    val seen = mutable.Set[String](startUrl)

    while (queue.nonEmpty) {
      val url = queue.dequeue()
      val response = readWithRetries(url, maxRetries)

      if (response == "congrats" || responseBody(response).contains("congrats")) return Some(url)

      for (nextUrl <- nextUrlsFrom(response)) {
        if (!seen.contains(nextUrl)) {
          seen += nextUrl
          queue.enqueue(nextUrl)
        }
      }
    }

    None
  }

  private def nextUrlsFrom(response: Any): Seq[String] = response match {
    case body: Map[_, _] =>
      val responseMap = body.asInstanceOf[Map[String, Any]]
      status(response) match {
        case Some(code) if code == 301 || code == 302 =>
          responseMap.get("location") match {
            case Some(location: String) => Seq(location)
            case _ => Seq.empty
          }
        case Some(200) =>
          urlsFromBody(responseMap.getOrElse("body", null))
        case _ =>
          urlsFromBody(response)
      }
    case _ =>
      Seq.empty
  }

  private def urlsFromBody(body: Any): Seq[String] = body match {
    case linkBody: Map[_, _] =>
      linkBody.asInstanceOf[Map[String, Any]].get("urls") match {
        case Some(urls: Seq[_]) => urls.collect { case url: String => url }
        case _ => Seq.empty
      }
    case _ =>
      Seq.empty
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

  private def responseBody(response: Any): Option[Any] = response match {
    case body: Map[_, _] if status(response).contains(200) =>
      body.asInstanceOf[Map[String, Any]].get("body")
    case _ => None
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
