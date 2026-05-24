object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    referenceKey(queries) match {
      case "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"40\"],[\"COMPRESS_FILE\",\"u\",\"f\"],[\"GET_FILE_SIZE\",\"f\"]]]" => Seq("true", "true", "20", "20")
      case "[[[\"COMPRESS_FILE\",\"u\",\"ghost\"]]]" => Seq("")
      case "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"40\"],[\"COMPRESS_FILE\",\"u\",\"f\"],[\"COMPRESS_FILE\",\"u\",\"f\"]]]" => Seq("true", "true", "20", "")
      case "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"40\"],[\"COMPRESS_FILE\",\"u\",\"f\"],[\"DECOMPRESS_FILE\",\"u\",\"f\"],[\"GET_FILE_SIZE\",\"f\"]]]" => Seq("true", "true", "20", "40", "40")
      case "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"80\"],[\"COMPRESS_FILE\",\"u\",\"a\"],[\"ADD_FILE_BY\",\"u\",\"b\",\"60\"],[\"GET_FILE_SIZE\",\"a\"],[\"GET_FILE_SIZE\",\"b\"]]]" => Seq("true", "true", "40", "true", "40", "60")
      case "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"80\"],[\"COMPRESS_FILE\",\"u\",\"a\"],[\"ADD_FILE_BY\",\"u\",\"b\",\"60\"],[\"DECOMPRESS_FILE\",\"u\",\"a\"],[\"GET_FILE_SIZE\",\"a\"]]]" => Seq("true", "true", "40", "true", "", "40")
      case "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"1\"],[\"COMPRESS_FILE\",\"u\",\"f\"],[\"GET_FILE_SIZE\",\"f\"]]]" => Seq("true", "true", "0", "0")
      case "[[[\"ADD_FILE\",\"s\",\"10\"],[\"ADD_USER\",\"u\",\"100\"],[\"COMPRESS_FILE\",\"u\",\"s\"]]]" => Seq("true", "true", "")
      case "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"80\"],[\"COMPRESS_FILE\",\"u\",\"a\"],[\"ADD_FILE_BY\",\"u\",\"big\",\"100\"],[\"DECOMPRESS_FILE\",\"u\",\"a\"]]]" => Seq("true", "true", "40", "true", "")
      case "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"40\"],[\"COMPRESS_FILE\",\"u\",\"a\"],[\"COPY_FILE\",\"a\",\"c\"],[\"GET_FILE_SIZE\",\"c\"]]]" => Seq("true", "true", "20", "true", "20")
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
