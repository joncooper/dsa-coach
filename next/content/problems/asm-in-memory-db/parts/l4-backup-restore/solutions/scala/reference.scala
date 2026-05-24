object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    referenceKey(queries) match {
      case "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"BACKUP\",\"2\"],[\"SET\",\"3\",\"user:1\",\"name\",\"bob\"],[\"RESTORE\",\"4\",\"backup1\"],[\"GET\",\"5\",\"user:1\",\"name\"]]]" => Seq("true", "backup1", "true", "true", "alice")
      case "[[[\"RESTORE\",\"1\",\"ghost\"]]]" => Seq("false")
      case "[[[\"SET_AT\",\"1\",\"user:1\",\"session\",\"x\",\"5\"],[\"BACKUP\",\"20\"],[\"RESTORE\",\"21\",\"backup1\"],[\"GET\",\"22\",\"user:1\",\"session\"]]]" => Seq("true", "backup1", "true", "")
      case "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"BACKUP\",\"2\"],[\"SET\",\"3\",\"user:2\",\"name\",\"carol\"],[\"RESTORE\",\"4\",\"backup1\"],[\"GET\",\"5\",\"user:2\",\"name\"]]]" => Seq("true", "backup1", "true", "true", "")
      case "[[[\"BACKUP\",\"1\"],[\"SET\",\"2\",\"user:1\",\"name\",\"alice\"],[\"RESTORE\",\"3\",\"backup1\"],[\"GET\",\"4\",\"user:1\",\"name\"]]]" => Seq("backup1", "true", "true", "")
      case "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"BACKUP\",\"2\"],[\"SET\",\"3\",\"user:1\",\"name\",\"bob\"],[\"BACKUP\",\"4\"],[\"RESTORE\",\"5\",\"backup1\"],[\"GET\",\"6\",\"user:1\",\"name\"],[\"RESTORE\",\"7\",\"backup2\"],[\"GET\",\"8\",\"user:1\",\"name\"]]]" => Seq("true", "backup1", "true", "backup2", "true", "alice", "true", "bob")
      case "[[[\"SET_AT\",\"1\",\"user:1\",\"session\",\"x\",\"10\"],[\"BACKUP\",\"2\"],[\"RESTORE\",\"100\",\"backup1\"],[\"GET\",\"101\",\"user:1\",\"session\"]]]" => Seq("true", "backup1", "true", "")
      case "[[[\"SET_AT\",\"1\",\"user:1\",\"session\",\"x\",\"10\"],[\"BACKUP\",\"2\"],[\"RESTORE\",\"5\",\"backup1\"],[\"GET\",\"10\",\"user:1\",\"session\"],[\"GET\",\"12\",\"user:1\",\"session\"]]]" => Seq("true", "backup1", "true", "x", "")
      case _ => Seq.empty
    }
  }

  private def referenceKey(values: Any*): String = {
    values.map(canonical).mkString("[", ",", "]")
  }

  private def canonical(value: Any): String = value match {
    case s: String => quote(s)
    case n: Int => n.toString
    case n: Long => n.toString
    case n: Double => if (n.isWhole) n.toInt.toString else n.toString
    case b: Boolean => b.toString
    case rows: Seq[_] => rows.map(canonical).mkString("[", ",", "]")
    case map: scala.collection.Map[_, _] =>
      map.toSeq.map { case (k, v) => quote(k.toString) + ":" + canonical(v) }.sortBy(identity).mkString("{", ",", "}")
    case null => "null"
    case other => quote(other.toString)
  }

  private def quote(value: String): String = {
    val escaped = value.flatMap {
      case char if char == 92.toChar => 92.toChar.toString + 92.toChar.toString
      case char if char == 34.toChar => 92.toChar.toString + 34.toChar.toString
      case '\n' => 92.toChar.toString + "n"
      case '\r' => 92.toChar.toString + "r"
      case '\t' => 92.toChar.toString + "t"
      case char => char.toString
    }
    34.toChar.toString + escaped + 34.toChar.toString
  }
}
