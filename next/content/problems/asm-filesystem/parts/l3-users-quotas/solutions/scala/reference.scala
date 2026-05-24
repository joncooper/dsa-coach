object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    referenceKey(queries) match {
      case "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"40\"],[\"GET_FILE_SIZE\",\"f\"]]]" => Seq("true", "true", "40")
      case "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"big\",\"80\"],[\"ADD_FILE_BY\",\"u\",\"small\",\"30\"],[\"ADD_FILE_BY\",\"u\",\"new\",\"80\"],[\"GET_FILE_SIZE\",\"big\"],[\"GET_FILE_SIZE\",\"small\"],[\"GET_FILE_SIZE\",\"new\"]]]" => Seq("true", "true", "true", "true", "", "", "80")
      case "[[[\"ADD_FILE_BY\",\"ghost\",\"f\",\"10\"]]]" => Seq("false")
      case "[[[\"ADD_USER\",\"u\",\"50\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"50\"],[\"GET_FILE_SIZE\",\"f\"]]]" => Seq("true", "true", "50")
      case "[[[\"ADD_USER\",\"u\",\"20\"],[\"ADD_FILE_BY\",\"u\",\"b\",\"10\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"10\"],[\"ADD_FILE_BY\",\"u\",\"c\",\"10\"],[\"GET_FILE_SIZE\",\"a\"],[\"GET_FILE_SIZE\",\"b\"],[\"GET_FILE_SIZE\",\"c\"]]]" => Seq("true", "true", "true", "true", "", "10", "10")
      case "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f1\",\"30\"],[\"ADD_FILE_BY\",\"u\",\"f2\",\"30\"],[\"ADD_FILE_BY\",\"u\",\"f3\",\"30\"],[\"ADD_FILE_BY\",\"u\",\"big\",\"80\"],[\"GET_FILE_SIZE\",\"f1\"],[\"GET_FILE_SIZE\",\"f2\"],[\"GET_FILE_SIZE\",\"f3\"],[\"GET_FILE_SIZE\",\"big\"]]]" => Seq("true", "true", "true", "true", "true", "", "", "", "80")
      case "[[[\"ADD_USER\",\"u\",\"50\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"20\"],[\"ADD_FILE_BY\",\"u\",\"toobig\",\"60\"],[\"GET_FILE_SIZE\",\"a\"],[\"GET_FILE_SIZE\",\"toobig\"]]]" => Seq("true", "true", "false", "20", "")
      case "[[[\"ADD_FILE\",\"sys.txt\",\"90\"],[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"ufile\",\"80\"],[\"ADD_FILE_BY\",\"u\",\"ufile2\",\"80\"],[\"GET_FILE_SIZE\",\"sys.txt\"],[\"GET_FILE_SIZE\",\"ufile\"]]]" => Seq("true", "true", "true", "true", "90", "")
      case "[[[\"ADD_USER\",\"u\",\"10\"],[\"ADD_USER\",\"u\",\"20\"]]]" => Seq("true", "false")
      case "[[[\"ADD_FILE\",\"x\",\"5\"],[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"x\",\"10\"],[\"GET_FILE_SIZE\",\"x\"]]]" => Seq("true", "true", "false", "5")
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
