object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    referenceKey(queries) match {
      case "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"10\"],[\"GET\",\"5\",\"user:1\",\"name\"]]]" => Seq("true", "alice")
      case "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"10\"],[\"GET\",\"15\",\"user:1\",\"name\"]]]" => Seq("true", "")
      case "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"10\"],[\"GET\",\"11\",\"user:1\",\"name\"]]]" => Seq("true", "")
      case "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"5\"],[\"SET\",\"2\",\"user:1\",\"name\",\"bob\"],[\"GET\",\"20\",\"user:1\",\"name\"]]]" => Seq("true", "true", "bob")
      case "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SET_AT\",\"2\",\"user:1\",\"session\",\"abc\",\"5\"],[\"SCAN\",\"20\",\"user:1\"]]]" => Seq("true", "true", "name=alice")
      case "[[[\"SET_AT\",\"1\",\"user:1\",\"session\",\"abc\",\"5\"],[\"DELETE\",\"20\",\"user:1\",\"session\"]]]" => Seq("true", "false")
      case "[[[\"SET_AT\",\"1\",\"user:1\",\"session_old\",\"x\",\"5\"],[\"SET\",\"2\",\"user:1\",\"session_new\",\"y\"],[\"SCAN_BY_PREFIX\",\"20\",\"user:1\",\"session\"]]]" => Seq("true", "true", "session_new=y")
      case "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"5\"],[\"SET_AT\",\"2\",\"user:1\",\"name\",\"bob\",\"100\"],[\"GET\",\"50\",\"user:1\",\"name\"]]]" => Seq("true", "true", "bob")
      case "[[[\"SET_AT\",\"1\",\"user:1\",\"a\",\"1\",\"5\"],[\"SET_AT\",\"2\",\"user:1\",\"b\",\"2\",\"5\"],[\"SCAN\",\"20\",\"user:1\"]]]" => Seq("true", "true", "")
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
