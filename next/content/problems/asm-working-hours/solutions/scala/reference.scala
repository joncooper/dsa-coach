object Solution {
  private case class Session(start: Int, end: Int, position: String, compensation: Int)
  private case class PendingPromotion(position: String, compensation: Int, start: Int)
  private case class Worker(
      var position: String,
      var compensation: Int,
      var insideSince: Option[Int],
      var activePosition: String,
      var activeCompensation: Int,
      var totalTime: Int,
      timeByPosition: scala.collection.mutable.Map[String, Int],
      sessions: scala.collection.mutable.ArrayBuffer[Session],
      var pending: Option[PendingPromotion]
  )

  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    val workers = scala.collection.mutable.Map.empty[String, Worker]
    val doublePay = scala.collection.mutable.ArrayBuffer.empty[(Int, Int)]
    val out = scala.collection.mutable.ArrayBuffer.empty[String]

    def coveredDoubleTime(start: Int, end: Int): Int = {
      val clipped = doublePay.flatMap { case (periodStart, periodEnd) =>
        val left = math.max(start, periodStart)
        val right = math.min(end, periodEnd)
        if (left < right) Some((left, right)) else None
      }.sortBy { case (left, right) => (left, right) }

      if (clipped.isEmpty) 0
      else {
        var currentStart = clipped.head._1
        var currentEnd = clipped.head._2
        var total = 0
        for ((left, right) <- clipped.tail) {
          if (left <= currentEnd) currentEnd = math.max(currentEnd, right)
          else {
            total += currentEnd - currentStart
            currentStart = left
            currentEnd = right
          }
        }
        total + currentEnd - currentStart
      }
    }

    def addSession(worker: Worker, start: Int, end: Int): Unit = {
      if (end > start) {
        val duration = end - start
        worker.totalTime += duration
        worker.timeByPosition(worker.activePosition) = worker.timeByPosition.getOrElse(worker.activePosition, 0) + duration
        worker.sessions += Session(start, end, worker.activePosition, worker.activeCompensation)
      }
    }

    def applyPendingOnEntry(worker: Worker, timestamp: Int): Unit =
      worker.pending match {
        case Some(pending) if timestamp >= pending.start =>
          worker.position = pending.position
          worker.compensation = pending.compensation
          worker.pending = None
        case _ =>
      }

    def calcSalary(worker: Worker, start: Int, end: Int): Int = {
      var total = 0
      for (session <- worker.sessions) {
        val left = math.max(start, session.start)
        val right = math.min(end, session.end)
        if (left < right) {
          total += (right - left) * session.compensation
          total += coveredDoubleTime(left, right) * session.compensation
        }
      }
      total
    }

    def topWorkers(count: Int, position: String): String =
      if (count <= 0) ""
      else workers.toSeq
        .filter { case (_, worker) => worker.position == position }
        .map { case (workerId, worker) => workerId -> worker.timeByPosition.getOrElse(position, 0) }
        .sortBy { case (workerId, time) => (-time, workerId) }
        .take(count)
        .map { case (workerId, time) => s"$workerId($time)" }
        .mkString(",")

    for (query <- queries) query.head match {
      case "ADD_WORKER" =>
        val workerId = query(1)
        val position = query(2)
        val compensation = query(3).toInt
        if (workers.contains(workerId)) out += "false"
        else {
          workers(workerId) = Worker(
            position,
            compensation,
            None,
            position,
            compensation,
            0,
            scala.collection.mutable.Map.empty[String, Int],
            scala.collection.mutable.ArrayBuffer.empty[Session],
            None
          )
          out += "true"
        }

      case "REGISTER" =>
        workers.get(query(1)) match {
          case None => out += "invalid_request"
          case Some(worker) =>
            val timestamp = query(2).toInt
            worker.insideSince match {
              case None =>
                applyPendingOnEntry(worker, timestamp)
                worker.insideSince = Some(timestamp)
                worker.activePosition = worker.position
                worker.activeCompensation = worker.compensation
                out += "registered"
              case Some(start) =>
                addSession(worker, start, timestamp)
                worker.insideSince = None
                out += "registered"
            }
        }

      case "GET" =>
        out += workers.get(query(1)).map(_.totalTime.toString).getOrElse("")

      case "TOP_N_WORKERS" =>
        out += topWorkers(query(1).toInt, query(2))

      case "PROMOTE" =>
        workers.get(query(1)) match {
          case Some(worker) if worker.pending.isEmpty =>
            worker.pending = Some(PendingPromotion(query(2), query(3).toInt, query(4).toInt))
            out += "success"
          case _ => out += "invalid_request"
        }

      case "CALC_SALARY" =>
        out += workers.get(query(1)).map(worker => calcSalary(worker, query(2).toInt, query(3).toInt).toString).getOrElse("")

      case "SET_DOUBLE_PAY" =>
        val start = query(1).toInt
        val end = query(2).toInt
        if (start >= end) out += "false"
        else {
          doublePay += ((start, end))
          out += "true"
        }

      case _ => out += ""
    }

    out.toSeq
  }
}
