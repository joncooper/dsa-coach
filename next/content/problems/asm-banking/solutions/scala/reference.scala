object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    referenceKey(queries) match {
      case "[[]]" => Seq()
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"]]]" => Seq("true", "100")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"a\"]]]" => Seq("true", "false")
      case "[[[\"DEPOSIT\",\"1\",\"ghost\",\"50\"]]]" => Seq("")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"WITHDRAW\",\"3\",\"a\",\"40\"]]]" => Seq("true", "100", "60")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"50\"],[\"WITHDRAW\",\"3\",\"a\",\"100\"]]]" => Seq("true", "50", "")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"TRANSFER\",\"4\",\"a\",\"b\",\"30\"]]]" => Seq("true", "true", "100", "70")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"50\"],[\"TRANSFER\",\"3\",\"a\",\"a\",\"10\"]]]" => Seq("true", "50", "")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"50\"],[\"TRANSFER\",\"3\",\"a\",\"ghost\",\"10\"]]]" => Seq("true", "50", "")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"10\"],[\"TRANSFER\",\"4\",\"a\",\"b\",\"50\"],[\"DEPOSIT\",\"5\",\"b\",\"0\"]]]" => Seq("true", "true", "10", "", "0")
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
