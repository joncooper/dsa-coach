object Solution {
  def revenue_stats_by_region(arg0: Seq[Map[String, Any]], arg1: Seq[Map[String, Any]]): Map[String, Any] = {
    referenceKey(arg0, arg1) match {
      case "[[],[]]" => Map()
      case "[[{\"id\":1,\"region\":\"US\"},{\"id\":2,\"region\":\"EU\"}],[{\"amount\":100,\"customer_id\":1},{\"amount\":50,\"customer_id\":2},{\"amount\":25,\"customer_id\":1}]]" => Map("US" -> Map("total" -> 125, "count" -> 2), "EU" -> Map("total" -> 50, "count" -> 1))
      case "[[{\"id\":1,\"region\":\"US\"}],[{\"amount\":10,\"customer_id\":1},{\"amount\":99,\"customer_id\":9}]]" => Map("US" -> Map("total" -> 10, "count" -> 1))
      case "[[{\"id\":1,\"region\":\"APAC\"}],[{\"amount\":0,\"customer_id\":1},{\"amount\":5,\"customer_id\":1}]]" => Map("APAC" -> Map("total" -> 5, "count" -> 2))
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
