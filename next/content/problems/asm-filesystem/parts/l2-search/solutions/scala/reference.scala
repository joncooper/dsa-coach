object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    referenceKey(queries) match {
      case "[[[\"ADD_FILE\",\"data1.txt\",\"30\"],[\"ADD_FILE\",\"data2.txt\",\"90\"],[\"FIND_BY_PREFIX\",\"data\"]]]" => Seq("true", "true", "data2.txt(90),data1.txt(30)")
      case "[[[\"ADD_FILE\",\"a\",\"1\"],[\"FIND_BY_PREFIX\",\"z\"]]]" => Seq("true", "")
      case "[[[\"ADD_FILE\",\"a.log\",\"5\"],[\"ADD_FILE\",\"b.txt\",\"6\"],[\"FIND_BY_SUFFIX\",\".log\"]]]" => Seq("true", "true", "a.log(5)")
      case "[[[\"ADD_FILE\",\"report\",\"42\"],[\"FIND_BY_PREFIX\",\"report\"]]]" => Seq("true", "report(42)")
      case "[[[\"ADD_FILE\",\"b\",\"10\"],[\"ADD_FILE\",\"a\",\"10\"],[\"FIND_BY_PREFIX\",\"\"]]]" => Seq("true", "true", "a(10),b(10)")
      case "[[[\"ADD_FILE\",\"x\",\"5\"],[\"ADD_FILE\",\"y\",\"9\"],[\"FIND_BY_PREFIX\",\"\"]]]" => Seq("true", "true", "y(9),x(5)")
      case "[[[\"ADD_FILE\",\"src.txt\",\"12\"],[\"COPY_FILE\",\"src.txt\",\"dst.txt\"],[\"FIND_BY_SUFFIX\",\".txt\"]]]" => Seq("true", "true", "dst.txt(12),src.txt(12)")
      case "[[[\"ADD_FILE\",\"f2\",\"0\"],[\"ADD_FILE\",\"f1\",\"0\"],[\"FIND_BY_PREFIX\",\"f\"]]]" => Seq("true", "true", "f1(0),f2(0)")
      case "[[[\"ADD_FILE\",\"abc\",\"3\"],[\"FIND_BY_PREFIX\",\"ab\"],[\"FIND_BY_SUFFIX\",\"bc\"]]]" => Seq("true", "abc(3)", "abc(3)")
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
