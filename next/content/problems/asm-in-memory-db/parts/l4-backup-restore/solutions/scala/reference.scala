object Solution {
  private case class FieldKey(key: String, field: String)
  private case class Backup(store: Map[String, Map[String, String]], ttls: Map[FieldKey, Int])

  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    var store = scala.collection.mutable.Map.empty[String, scala.collection.mutable.Map[String, String]]
    var ttls = scala.collection.mutable.Map.empty[FieldKey, Int]
    val backups = scala.collection.mutable.Map.empty[String, Backup]
    val out = scala.collection.mutable.ArrayBuffer.empty[String]
    var backupSeq = 0

    def render(rows: Iterable[(String, String)]): String =
      rows.toSeq.sortBy(_._1).map { case (field, value) => s"$field=$value" }.mkString(",")

    def alive(key: String, field: String, timestamp: Int): Boolean =
      store.get(key).exists(_.contains(field)) && ttls.get(FieldKey(key, field)).forall(timestamp < _)

    def deleteField(key: String, field: String): Unit = {
      store.get(key).foreach { fields =>
        fields.remove(field)
        if (fields.isEmpty) store.remove(key)
      }
      ttls.remove(FieldKey(key, field))
    }

    def liveRows(key: String, timestamp: Int, prefix: String = ""): Seq[(String, String)] =
      store.get(key).toSeq.flatMap(_.toSeq).filter { case (field, _) => field.startsWith(prefix) && alive(key, field, timestamp) }

    for (query <- queries) {
      val timestamp = query(1).toInt
      query.head match {
        case "SET" =>
          val fields = store.getOrElseUpdate(query(2), scala.collection.mutable.Map.empty[String, String])
          fields(query(3)) = query(4)
          ttls.remove(FieldKey(query(2), query(3)))
          out += "true"
        case "SET_AT" =>
          val fields = store.getOrElseUpdate(query(2), scala.collection.mutable.Map.empty[String, String])
          fields(query(3)) = query(4)
          ttls(FieldKey(query(2), query(3))) = timestamp + query(5).toInt
          out += "true"
        case "GET" => out += (if (alive(query(2), query(3), timestamp)) store(query(2))(query(3)) else "")
        case "DELETE" =>
          if (alive(query(2), query(3), timestamp)) {
            deleteField(query(2), query(3))
            out += "true"
          } else out += "false"
        case "SCAN" => out += render(liveRows(query(2), timestamp))
        case "SCAN_BY_PREFIX" => out += render(liveRows(query(2), timestamp, query(3)))
        case "BACKUP" =>
          backupSeq += 1
          val id = s"backup$backupSeq"
          val snapStore = store.flatMap { case (key, fields) =>
            val live = fields.collect { case (field, value) if alive(key, field, timestamp) => field -> value }.toMap
            if (live.nonEmpty) Some(key -> live) else None
          }.toMap
          val snapTtls = ttls.collect { case (pair, expiresAt) if snapStore.get(pair.key).exists(_.contains(pair.field)) => pair -> expiresAt }.toMap
          backups(id) = Backup(snapStore, snapTtls)
          out += id
        case "RESTORE" =>
          backups.get(query(2)) match {
            case None => out += "false"
            case Some(snapshot) =>
              store = scala.collection.mutable.Map(snapshot.store.map { case (key, fields) => key -> scala.collection.mutable.Map(fields.toSeq: _*) }.toSeq: _*)
              ttls = scala.collection.mutable.Map(snapshot.ttls.toSeq: _*)
              for ((pair, expiresAt) <- ttls.toSeq if expiresAt <= timestamp) deleteField(pair.key, pair.field)
              out += "true"
          }
        case _ => out += ""
      }
    }

    out.toSeq
  }
}
