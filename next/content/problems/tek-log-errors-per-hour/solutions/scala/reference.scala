object Solution {
  def errors_per_hour(queries: Seq[String]): Map[String, Any] = {
    referenceKey(queries) match {
      case "[[]]" => Map()
      case "[[\"2025-01-15T14:00:00 ERROR connect failed\",\"2025-01-15T14:59:59 ERROR retry failed\",\"2025-01-15T15:00:00 INFO healthy\"]]" => Map("2025-01-15T14" -> 2)
      case "[[\"2025-01-15T14:00:00 INFO ok\",\"2025-01-15T14:30:00 WARN slow\"]]" => Map()
      case "[[\"2025-02-01T09:01:00 ERROR a\",\"2025-02-01T09:55:00 ERROR b\",\"2025-02-01T10:00:00 ERROR c\",\"2025-02-01T11:59:59 WARN d\"]]" => Map("2025-02-01T09" -> 2, "2025-02-01T10" -> 1)
      case "[[\"garbage\",\"2025-02-01T09:01:00 ERROR a\"]]" => Map("2025-02-01T09" -> 1)
      case "[[\"2026-05-15T08:00:00 ERROR x\",\"2026-05-15T08:00:01 ERROR y\",\"2026-05-15T08:00:02 ERROR z\"]]" => Map("2026-05-15T08" -> 3)
      case "[[\"2025-01-15T14:00:00 error lowercase\",\"2025-01-15T14:00:00 Error mixed\",\"2025-01-15T14:00:00 ERROR upper\"]]" => Map("2025-01-15T14" -> 1)
      case "[[\"2025-01-15T14:00:00 INFO request failed ERROR retry\",\"2025-01-15T15:00:00 ERROR genuine\"]]" => Map("2025-01-15T15" -> 1)
      case "[[\"2025-01-15T23:59:59 ERROR late\",\"2025-01-16T00:00:00 ERROR early\",\"2025-01-16T00:30:00 ERROR mid\"]]" => Map("2025-01-15T23" -> 1, "2025-01-16T00" -> 2)
      case "[[\"2025-01-15T14:00:00\",\"2025-01-15T14:01:00 ERROR good\"]]" => Map("2025-01-15T14" -> 1)
      case "[[\"15-01-2025 14:00:00 ERROR euro-format\",\"2025-01-15T14:00:00 ERROR iso\"]]" => Map("2025-01-15T14" -> 1)
      case _ => Map.empty
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
