object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    val files = scala.collection.mutable.Map.empty[String, Int]
    val out = scala.collection.mutable.ArrayBuffer.empty[String]

    def render(rows: Iterable[(String, Int)]): String =
      rows.toSeq.sortBy { case (name, size) => (-size, name) }.map { case (name, size) => s"$name($size)" }.mkString(",")

    for (query <- queries) query.head match {
      case "ADD_FILE" =>
        val name = query(1)
        if (files.contains(name)) out += "false"
        else {
          files(name) = query(2).toInt
          out += "true"
        }
      case "GET_FILE_SIZE" => out += files.get(query(1)).map(_.toString).getOrElse("")
      case "COPY_FILE" =>
        files.get(query(1)) match {
          case Some(size) =>
            files(query(2)) = size
            out += "true"
          case None => out += "false"
        }
      case "FIND_BY_PREFIX" => out += render(files.filter { case (name, _) => name.startsWith(query(1)) })
      case "FIND_BY_SUFFIX" => out += render(files.filter { case (name, _) => name.endsWith(query(1)) })
      case _ => out += ""
    }

    out.toSeq
  }
}
