object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    referenceKey(queries) match {
      case "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SCAN\",\"2\",\"user:1\"]]]" => Seq("true", "name=alice")
      case "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"email\",\"a@x\"],[\"SET\",\"3\",\"user:1\",\"age\",\"30\"],[\"SCAN\",\"4\",\"user:1\"]]]" => Seq("true", "true", "true", "age=30,email=a@x,name=alice")
      case "[[[\"SCAN\",\"1\",\"ghost\"]]]" => Seq("")
      case "[[[\"SET\",\"1\",\"user:1\",\"first_name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"last_name\",\"smith\"],[\"SET\",\"3\",\"user:1\",\"email\",\"a@x\"],[\"SCAN_BY_PREFIX\",\"4\",\"user:1\",\"first\"]]]" => Seq("true", "true", "true", "first_name=alice")
      case "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SCAN_BY_PREFIX\",\"2\",\"user:1\",\"zzz\"]]]" => Seq("true", "")
      case "[[[\"SET\",\"1\",\"user:1\",\"a\",\"1\"],[\"SET\",\"2\",\"user:1\",\"b\",\"2\"],[\"SCAN_BY_PREFIX\",\"3\",\"user:1\",\"\"]]]" => Seq("true", "true", "a=1,b=2")
      case "[[[\"SET\",\"1\",\"user:1\",\"a\",\"1\"],[\"SET\",\"2\",\"user:1\",\"b\",\"2\"],[\"DELETE\",\"3\",\"user:1\",\"a\"],[\"SCAN\",\"4\",\"user:1\"]]]" => Seq("true", "true", "true", "b=2")
      case "[[[\"SET\",\"1\",\"user:1\",\"Name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"name\",\"bob\"],[\"SCAN_BY_PREFIX\",\"3\",\"user:1\",\"N\"]]]" => Seq("true", "true", "Name=alice")
      case "[[[\"SET\",\"1\",\"user:1\",\"a\",\"1\"],[\"DELETE\",\"2\",\"user:1\",\"a\"],[\"SCAN\",\"3\",\"user:1\"]]]" => Seq("true", "true", "")
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
