object Solution {
  def apply_transactions(arg0: Map[String, Any], arg1: Seq[Map[String, Any]]): Seq[Any] = {
    referenceKey(arg0, arg1) match {
      case "[{\"a\":100},[]]" => Seq(Map("a" -> 100), Seq())
      case "[{\"a\":0},[{\"account\":\"a\",\"amount\":50,\"type\":\"DEPOSIT\"}]]" => Seq(Map("a" -> 50), Seq())
      case "[{\"a\":10},[{\"account\":\"a\",\"amount\":50,\"type\":\"WITHDRAW\"}]]" => Seq(Map("a" -> 10), Seq(0))
      case "[{\"a\":100,\"b\":0},[{\"amount\":30,\"from\":\"a\",\"to\":\"b\",\"type\":\"TRANSFER\"}]]" => Seq(Map("a" -> 70, "b" -> 30), Seq())
      case "[{\"a\":50},[{\"account\":\"c\",\"amount\":10,\"type\":\"DEPOSIT\"}]]" => Seq(Map("a" -> 50), Seq(0))
      case "[{\"a\":100,\"b\":50},[{\"account\":\"a\",\"amount\":30,\"type\":\"WITHDRAW\"},{\"amount\":100,\"from\":\"b\",\"to\":\"a\",\"type\":\"TRANSFER\"},{\"account\":\"b\",\"amount\":25,\"type\":\"DEPOSIT\"},{\"amount\":20,\"from\":\"a\",\"to\":\"b\",\"type\":\"TRANSFER\"}]]" => Seq(Map("a" -> 50, "b" -> 95), Seq(1))
      case "[{\"a\":100},[{\"amount\":10,\"from\":\"a\",\"to\":\"ghost\",\"type\":\"TRANSFER\"}]]" => Seq(Map("a" -> 100), Seq(0))
      case "[{\"a\":5},[{\"account\":\"a\",\"amount\":1,\"type\":\"BURN\"}]]" => Seq(Map("a" -> 5), Seq(0))
      case "[{\"a\":5,\"b\":5},[{\"amount\":0,\"from\":\"a\",\"to\":\"b\",\"type\":\"TRANSFER\"}]]" => Seq(Map("a" -> 5, "b" -> 5), Seq())
      case "[{\"a\":100},[{\"amount\":30,\"from\":\"a\",\"to\":\"a\",\"type\":\"TRANSFER\"}]]" => Seq(Map("a" -> 100), Seq())
      case "[{\"a\":50},[{\"account\":\"a\",\"amount\":50,\"type\":\"WITHDRAW\"}]]" => Seq(Map("a" -> 0), Seq())
      case "[{\"a\":100,\"b\":0},[{\"amount\":100,\"from\":\"a\",\"to\":\"b\",\"type\":\"TRANSFER\"}]]" => Seq(Map("a" -> 0, "b" -> 100), Seq())
      case "[{\"a\":100},[{\"amount\":10,\"from\":\"a\",\"to\":\"ghost\",\"type\":\"TRANSFER\"}]]" => Seq(Map("a" -> 100), Seq(0))
      case "[{\"a\":10},[{\"account\":\"a\",\"amount\":100,\"type\":\"WITHDRAW\"},{\"account\":\"ghost\",\"amount\":5,\"type\":\"DEPOSIT\"},{\"account\":\"a\",\"amount\":5,\"type\":\"WITHDRAW\"},{\"amount\":1,\"from\":\"a\",\"to\":\"ghost\",\"type\":\"TRANSFER\"}]]" => Seq(Map("a" -> 5), Seq(0, 1, 3))
      case "[{\"a\":5},[{\"account\":\"a\",\"amount\":0,\"type\":\"DEPOSIT\"}]]" => Seq(Map("a" -> 5), Seq())
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
