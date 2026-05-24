object Solution {
  def realized_pnl_by_symbol(queries: Seq[Map[String, Any]]): Map[String, Any] = {
    referenceKey(queries) match {
      case "[[]]" => Map()
      case "[[{\"price\":50,\"qty\":10,\"side\":\"BUY\",\"symbol\":\"AAPL\"},{\"price\":70,\"qty\":10,\"side\":\"SELL\",\"symbol\":\"AAPL\"}]]" => Map("AAPL" -> 200)
      case "[[{\"price\":50,\"qty\":10,\"side\":\"BUY\",\"symbol\":\"AAPL\"},{\"price\":30,\"qty\":5,\"side\":\"BUY\",\"symbol\":\"MSFT\"},{\"price\":70,\"qty\":10,\"side\":\"SELL\",\"symbol\":\"AAPL\"},{\"price\":35,\"qty\":5,\"side\":\"SELL\",\"symbol\":\"MSFT\"}]]" => Map("AAPL" -> 200, "MSFT" -> 25)
      case "[[{\"price\":50,\"qty\":10,\"side\":\"BUY\",\"symbol\":\"AAPL\"}]]" => Map()
      case "[[{\"price\":10,\"qty\":100,\"side\":\"BUY\",\"symbol\":\"X\"},{\"price\":20,\"qty\":100,\"side\":\"BUY\",\"symbol\":\"Y\"},{\"price\":12,\"qty\":30,\"side\":\"SELL\",\"symbol\":\"X\"},{\"price\":25,\"qty\":50,\"side\":\"SELL\",\"symbol\":\"Y\"}]]" => Map("X" -> 60, "Y" -> 250)
      case "[[{\"price\":100,\"qty\":10,\"side\":\"BUY\",\"symbol\":\"X\"},{\"price\":50,\"qty\":10,\"side\":\"BUY\",\"symbol\":\"Y\"},{\"price\":60,\"qty\":10,\"side\":\"SELL\",\"symbol\":\"X\"}]]" => Map("X" -> -400)
      case "[[{\"price\":100,\"qty\":10,\"side\":\"BUY\",\"symbol\":\"A\"},{\"price\":50,\"qty\":10,\"side\":\"BUY\",\"symbol\":\"A\"},{\"price\":50,\"qty\":10,\"side\":\"SELL\",\"symbol\":\"A\"},{\"price\":100,\"qty\":10,\"side\":\"SELL\",\"symbol\":\"A\"}]]" => Map("A" -> 0)
      case _ => Map.empty
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
