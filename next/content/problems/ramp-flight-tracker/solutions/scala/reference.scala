import scala.collection.mutable

object Solution {
  private case class Flight(depart: String, arrive: String, origin: String, destination: String)

  def userLocations(flights: Seq[Seq[String]], queryTime: String): Seq[Seq[String]] = {
    val byUser = mutable.Map[String, mutable.ArrayBuffer[Flight]]()
    for (row <- flights) {
      val userId = row(0)
      val timeline = byUser.getOrElseUpdate(userId, mutable.ArrayBuffer[Flight]())
      timeline += Flight(row(2), row(4), row(1), row(3))
    }

    byUser.keys.toSeq.sorted.map { userId =>
      val timeline = byUser(userId).sortBy(_.depart)
      var status = "UNKNOWN"
      for (flight <- timeline if queryTime >= flight.depart) {
        if (queryTime < flight.arrive) {
          status = s"IN_FLIGHT:${flight.origin}->${flight.destination}"
        } else {
          status = flight.destination
        }
      }
      Seq(userId, status)
    }
  }
}
