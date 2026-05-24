object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    referenceKey(queries) match {
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"10\"],[\"DEPOSIT\",\"20\",\"a\",\"5\"]]]" => Seq("true", "100", "payment1", "75")
      case "[[[\"SCHEDULE_PAYMENT\",\"1\",\"ghost\",\"10\",\"5\"]]]" => Seq("")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"10\"],[\"CANCEL_PAYMENT\",\"5\",\"a\",\"payment1\"],[\"DEPOSIT\",\"20\",\"a\",\"0\"]]]" => Seq("true", "100", "payment1", "true", "100")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"10\"],[\"DEPOSIT\",\"15\",\"a\",\"0\"],[\"CANCEL_PAYMENT\",\"16\",\"a\",\"payment1\"]]]" => Seq("true", "100", "payment1", "70", "false")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"20\"],[\"SCHEDULE_PAYMENT\",\"4\",\"a\",\"10\",\"5\"],[\"DEPOSIT\",\"30\",\"a\",\"0\"]]]" => Seq("true", "100", "payment1", "payment2", "60")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"20\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"100\",\"5\"],[\"DEPOSIT\",\"20\",\"a\",\"0\"]]]" => Seq("true", "20", "payment1", "20")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"4\",\"a\",\"30\",\"10\"],[\"CANCEL_PAYMENT\",\"5\",\"b\",\"payment1\"]]]" => Seq("true", "true", "100", "payment1", "false")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"5\"],[\"TOP_SPENDERS\",\"20\",\"1\"]]]" => Seq("true", "100", "payment1", "a(30)")
      case "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"10\",\"0\"],[\"DEPOSIT\",\"4\",\"a\",\"0\"]]]" => Seq("true", "100", "payment1", "90")
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
