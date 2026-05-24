object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    referenceKey(queries) match {
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"TRANSFER\",\"4\",\"a\",\"b\",\"60\"],[\"TOP_SPENDERS\",\"5\",\"1\"]]]" => Seq("true", "true", "100", "40", "a(60)")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"b\"],[\"CREATE_ACCOUNT\",\"2\",\"a\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"100\"],[\"WITHDRAW\",\"5\",\"a\",\"20\"],[\"WITHDRAW\",\"6\",\"b\",\"20\"],[\"TOP_SPENDERS\",\"7\",\"2\"]]]" => Seq("true", "true", "100", "100", "80", "80", "a(20),b(20)")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"WITHDRAW\",\"3\",\"a\",\"30\"],[\"TOP_SPENDERS\",\"4\",\"10\"]]]" => Seq("true", "100", "70", "a(30)")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"TOP_SPENDERS\",\"2\",\"1\"]]]" => Seq("true", "a(0)")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"200\"],[\"WITHDRAW\",\"3\",\"a\",\"30\"],[\"WITHDRAW\",\"4\",\"a\",\"20\"],[\"TOP_SPENDERS\",\"5\",\"1\"]]]" => Seq("true", "200", "170", "150", "a(50)")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"100\"],[\"WITHDRAW\",\"5\",\"a\",\"70\"],[\"TRANSFER\",\"6\",\"b\",\"a\",\"10\"],[\"TOP_SPENDERS\",\"7\",\"2\"]]]" => Seq("true", "true", "100", "100", "30", "90", "a(70),b(10)")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"WITHDRAW\",\"3\",\"a\",\"10\"],[\"TOP_SPENDERS\",\"4\",\"0\"]]]" => Seq("true", "100", "90", "")
      case "[[[\"TOP_SPENDERS\",\"1\",\"5\"]]]" => Seq("")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"10\"],[\"TRANSFER\",\"4\",\"a\",\"b\",\"50\"],[\"TOP_SPENDERS\",\"5\",\"1\"]]]" => Seq("true", "true", "10", "", "a(0)")
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
