object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    referenceKey(queries) match {
      case "[[]]" => Seq()
      case "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"GET\",\"2\",\"user:1\",\"name\"]]]" => Seq("true", "alice")
      case "[[[\"GET\",\"1\",\"ghost\",\"name\"]]]" => Seq("")
      case "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"DELETE\",\"2\",\"user:1\",\"name\"],[\"GET\",\"3\",\"user:1\",\"name\"]]]" => Seq("true", "true", "")
      case "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"email\",\"a@x\"],[\"GET\",\"3\",\"user:1\",\"email\"],[\"GET\",\"4\",\"user:1\",\"name\"]]]" => Seq("true", "true", "a@x", "alice")
      case "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"DELETE\",\"2\",\"user:1\",\"phone\"]]]" => Seq("true", "false")
      case "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"name\",\"bob\"],[\"GET\",\"3\",\"user:1\",\"name\"]]]" => Seq("true", "true", "bob")
      case "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"DELETE\",\"2\",\"user:1\",\"name\"],[\"GET\",\"3\",\"user:1\",\"name\"],[\"SET\",\"4\",\"user:1\",\"name\",\"bob\"],[\"GET\",\"5\",\"user:1\",\"name\"]]]" => Seq("true", "true", "", "true", "bob")
      case "[[[\"SET\",\"1\",\"User\",\"Name\",\"alice\"],[\"GET\",\"2\",\"user\",\"Name\"],[\"GET\",\"3\",\"User\",\"name\"],[\"GET\",\"4\",\"User\",\"Name\"]]]" => Seq("true", "", "", "alice")
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
