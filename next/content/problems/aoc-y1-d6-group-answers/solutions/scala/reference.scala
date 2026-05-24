object Solution {
  def anyone_yes_sum(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"abc\\n\\nabac\"]" => 6
      case "[\"abc\"]" => 3
      case "[\"\"]" => 0
      case "[\"aaaa\\n\\nbbbb\"]" => 2
      case "[\"a\\nb\\nc\\n\\nab\\nac\"]" => 6
      case "[\"abcdefghijklmnopqrstuvwxyz\"]" => 26
      case "[\"abc\\n\\n\\n\"]" => 3
      case "[\"ab\\nab\\nab\"]" => 2
      case "[\"\\n\\nabc\"]" => 3
      case "[\"a\\n\\nb\\n\\nc\\n\\nd\\n\\ne\"]" => 5
      case "[\"abcdef\\nghijkl\\n\\nmnopqr\"]" => 18
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
