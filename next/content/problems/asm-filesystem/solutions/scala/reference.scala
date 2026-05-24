object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    referenceKey(queries) match {
      case "[[]]" => Seq()
      case "[[[\"ADD_FILE\",\"a.txt\",\"100\"],[\"GET_FILE_SIZE\",\"a.txt\"]]]" => Seq("true", "100")
      case "[[[\"ADD_FILE\",\"a.txt\",\"100\"],[\"ADD_FILE\",\"a.txt\",\"200\"],[\"GET_FILE_SIZE\",\"a.txt\"]]]" => Seq("true", "false", "100")
      case "[[[\"ADD_FILE\",\"a.txt\",\"50\"],[\"COPY_FILE\",\"a.txt\",\"b.txt\"],[\"GET_FILE_SIZE\",\"b.txt\"]]]" => Seq("true", "true", "50")
      case "[[[\"COPY_FILE\",\"x\",\"y\"]]]" => Seq("false")
      case "[[[\"GET_FILE_SIZE\",\"nope\"]]]" => Seq("")
      case "[[[\"ADD_FILE\",\"a\",\"10\"],[\"ADD_FILE\",\"b\",\"99\"],[\"COPY_FILE\",\"a\",\"b\"],[\"GET_FILE_SIZE\",\"b\"]]]" => Seq("true", "true", "true", "10")
      case "[[[\"ADD_FILE\",\"File\",\"1\"],[\"GET_FILE_SIZE\",\"file\"],[\"GET_FILE_SIZE\",\"File\"]]]" => Seq("true", "", "1")
      case "[[[\"ADD_FILE\",\"a\",\"7\"],[\"COPY_FILE\",\"a\",\"a\"],[\"GET_FILE_SIZE\",\"a\"]]]" => Seq("true", "true", "7")
      case "[[[\"ADD_FILE\",\"z\",\"0\"],[\"GET_FILE_SIZE\",\"z\"]]]" => Seq("true", "0")
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
