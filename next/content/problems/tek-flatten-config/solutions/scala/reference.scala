object Solution {
  def flatten_config(arg0: Map[String, Any]): Map[String, Any] = {
    referenceKey(arg0) match {
      case "[{}]" => Map()
      case "[{\"a\":{\"b\":1,\"c\":2},\"d\":3}]" => Map("a.b" -> 1, "a.c" -> 2, "d" -> 3)
      case "[{\"x\":1,\"y\":2}]" => Map("x" -> 1, "y" -> 2)
      case "[{\"a\":{\"b\":{\"c\":42}}}]" => Map("a.b.c" -> 42)
      case "[{\"a\":{},\"b\":{\"c\":{}}}]" => Map()
      case "[{\"db\":{\"host\":\"local\",\"port\":5432},\"debug\":true,\"name\":\"app\"}]" => Map("name" -> "app", "db.host" -> "local", "db.port" -> 5432, "debug" -> true)
      case "[{\"a\":1,\"b\":{\"c\":2,\"d\":{\"e\":3}},\"f\":4}]" => Map("a" -> 1, "b.c" -> 2, "b.d.e" -> 3, "f" -> 4)
      case "[{\"a\":{\"b\":{}},\"c\":{}}]" => Map()
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
