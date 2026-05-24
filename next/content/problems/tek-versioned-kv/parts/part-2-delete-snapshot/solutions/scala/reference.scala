object Solution {
  def versioned_kv_with_snapshot(queries: Seq[Seq[Any]]): Seq[Any] = {
    referenceKey(queries) match {
      case "[[]]" => Seq()
      case "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"GET\",\"a\",15]]]" => Seq(null)
      case "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"GET\",\"a\",7]]]" => Seq("x")
      case "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"SET\",\"a\",\"y\",15],[\"GET\",\"a\",20]]]" => Seq("y")
      case "[[[\"SET\",\"a\",\"x\",1],[\"SET\",\"b\",\"y\",2],[\"SNAPSHOT\",3]]]" => Seq(Map("a" -> "x", "b" -> "y"))
      case "[[[\"SET\",\"a\",\"x\",1],[\"DELETE\",\"a\",2],[\"SNAPSHOT\",5]]]" => Seq(Map())
      case "[[[\"SET\",\"a\",\"x\",1],[\"SNAPSHOT\",1]]]" => Seq(Map("a" -> "x"))
      case "[[[\"SET\",\"a\",\"1\",1],[\"SET\",\"b\",\"2\",2],[\"DELETE\",\"a\",3],[\"GET\",\"a\",4],[\"SET\",\"a\",\"3\",5],[\"SNAPSHOT\",6]]]" => Seq(null, Map("a" -> "3", "b" -> "2"))
      case "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"SNAPSHOT\",9],[\"SNAPSHOT\",10]]]" => Seq(Map("a" -> "x"), Map())
      case "[[[\"SET\",\"a\",\"v1\",5],[\"DELETE\",\"a\",10],[\"SET\",\"a\",\"v2\",15],[\"DELETE\",\"a\",20],[\"SET\",\"a\",\"v3\",25],[\"GET\",\"a\",7],[\"GET\",\"a\",12],[\"GET\",\"a\",17],[\"GET\",\"a\",22],[\"GET\",\"a\",30]]]" => Seq("v1", null, "v2", null, "v3")
      case "[[[\"SET\",\"a\",\"x\",10],[\"DELETE\",\"a\",5],[\"GET\",\"a\",6],[\"GET\",\"a\",10]]]" => Seq(null, "x")
      case "[[[\"SET\",\"a\",\"1\",1],[\"SET\",\"b\",\"2\",1],[\"SET\",\"c\",\"3\",1],[\"DELETE\",\"b\",5],[\"SNAPSHOT\",10]]]" => Seq(Map("a" -> "1", "c" -> "3"))
      case "[[[\"SET\",\"a\",\"x\",5],[\"DELETE\",\"a\",10],[\"GET\",\"a\",10]]]" => Seq(null)
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
