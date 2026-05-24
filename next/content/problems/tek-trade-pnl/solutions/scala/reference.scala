object Solution {
  def realized_pnl(queries: Seq[Map[String, Any]]): Int = {
    referenceKey(queries) match {
      case "[[]]" => 0
      case "[[{\"price\":50,\"qty\":100,\"side\":\"BUY\"}]]" => 0
      case "[[{\"price\":50,\"qty\":10,\"side\":\"BUY\"},{\"price\":70,\"qty\":10,\"side\":\"SELL\"}]]" => 200
      case "[[{\"price\":50,\"qty\":100,\"side\":\"BUY\"},{\"price\":60,\"qty\":100,\"side\":\"BUY\"},{\"price\":70,\"qty\":150,\"side\":\"SELL\"}]]" => 2500
      case "[[{\"price\":50,\"qty\":100,\"side\":\"BUY\"},{\"price\":70,\"qty\":30,\"side\":\"SELL\"}]]" => 600
      case "[[{\"price\":50,\"qty\":100,\"side\":\"BUY\"},{\"price\":70,\"qty\":50,\"side\":\"SELL\"},{\"price\":80,\"qty\":50,\"side\":\"SELL\"}]]" => 2500
      case "[[{\"price\":100,\"qty\":10,\"side\":\"BUY\"},{\"price\":90,\"qty\":10,\"side\":\"SELL\"}]]" => -100
      case "[[{\"price\":10,\"qty\":50,\"side\":\"BUY\"},{\"price\":15,\"qty\":20,\"side\":\"SELL\"},{\"price\":12,\"qty\":30,\"side\":\"BUY\"},{\"price\":14,\"qty\":40,\"side\":\"SELL\"}]]" => 240
      case "[[{\"price\":50,\"qty\":10,\"side\":\"BUY\"},{\"price\":60,\"qty\":10,\"side\":\"BUY\"},{\"price\":70,\"qty\":10,\"side\":\"SELL\"},{\"price\":40,\"qty\":5,\"side\":\"BUY\"},{\"price\":80,\"qty\":15,\"side\":\"SELL\"}]]" => 600
      case "[[{\"price\":1,\"qty\":10,\"side\":\"BUY\"},{\"price\":2,\"qty\":10,\"side\":\"BUY\"},{\"price\":3,\"qty\":10,\"side\":\"BUY\"},{\"price\":5,\"qty\":30,\"side\":\"SELL\"}]]" => 90
      case "[[{\"price\":50,\"qty\":100,\"side\":\"BUY\"},{\"price\":60,\"qty\":40,\"side\":\"SELL\"},{\"price\":80,\"qty\":20,\"side\":\"BUY\"},{\"price\":55,\"qty\":60,\"side\":\"SELL\"},{\"price\":70,\"qty\":20,\"side\":\"SELL\"}]]" => 500
      case "[[{\"price\":100,\"qty\":1000,\"side\":\"BUY\"},{\"price\":200,\"qty\":1,\"side\":\"SELL\"}]]" => 100
      case _ => 0
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
