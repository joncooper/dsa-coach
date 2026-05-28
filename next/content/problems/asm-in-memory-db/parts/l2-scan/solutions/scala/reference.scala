object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    val store = scala.collection.mutable.Map.empty[String, scala.collection.mutable.Map[String, String]]
    val out = scala.collection.mutable.ArrayBuffer.empty[String]

    def render(rows: Iterable[(String, String)]): String =
      rows.toSeq.sortBy(_._1).map { case (field, value) => s"$field=$value" }.mkString(",")

    def deleteField(key: String, field: String): Boolean =
      store.get(key) match {
        case Some(fields) if fields.contains(field) =>
          fields.remove(field)
          if (fields.isEmpty) store.remove(key)
          true
        case _ => false
      }

    for (query <- queries) query.head match {
      case "SET" =>
        val fields = store.getOrElseUpdate(query(2), scala.collection.mutable.Map.empty[String, String])
        fields(query(3)) = query(4)
        out += "true"
      case "GET" => out += store.get(query(2)).flatMap(_.get(query(3))).getOrElse("")
      case "DELETE" => out += (if (deleteField(query(2), query(3))) "true" else "false")
      case "SCAN" => out += render(store.getOrElse(query(2), scala.collection.mutable.Map.empty[String, String]))
      case "SCAN_BY_PREFIX" => out += render(store.getOrElse(query(2), scala.collection.mutable.Map.empty[String, String]).filter { case (field, _) => field.startsWith(query(3)) })
      case _ => out += ""
    }

    out.toSeq
  }
}
