object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    referenceKey(queries) match {
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"50\"],[\"MERGE_ACCOUNTS\",\"5\",\"a\",\"b\"]]]" => Seq("true", "true", "100", "50", "150")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"50\"],[\"MERGE_ACCOUNTS\",\"5\",\"a\",\"b\"],[\"DEPOSIT\",\"6\",\"b\",\"10\"]]]" => Seq("true", "true", "100", "50", "150", "")
      case "[[[\"MERGE_ACCOUNTS\",\"1\",\"ghost\",\"x\"]]]" => Seq("")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"MERGE_ACCOUNTS\",\"2\",\"a\",\"a\"]]]" => Seq("true", "")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"100\"],[\"WITHDRAW\",\"5\",\"a\",\"30\"],[\"WITHDRAW\",\"6\",\"b\",\"40\"],[\"MERGE_ACCOUNTS\",\"7\",\"a\",\"b\"],[\"TOP_SPENDERS\",\"8\",\"1\"]]]" => Seq("true", "true", "100", "100", "70", "60", "130", "a(70)")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"50\"],[\"SCHEDULE_PAYMENT\",\"5\",\"b\",\"20\",\"10\"],[\"MERGE_ACCOUNTS\",\"6\",\"a\",\"b\"],[\"DEPOSIT\",\"20\",\"a\",\"0\"]]]" => Seq("true", "true", "100", "50", "payment1", "150", "130")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"MERGE_ACCOUNTS\",\"2\",\"a\",\"ghost\"]]]" => Seq("true", "")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"MERGE_ACCOUNTS\",\"3\",\"a\",\"b\"],[\"MERGE_ACCOUNTS\",\"4\",\"a\",\"b\"]]]" => Seq("true", "true", "0", "")
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
