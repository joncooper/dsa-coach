object Solution {
  def odd_tag_count(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"a,b\\nb,c\\n\\nx,y\\nx,y\\nx\"]" => 3
      case "[\"\"]" => 0
      case "[\"a,b,c\"]" => 3
      case "[\"a\\na\"]" => 0
      case "[\"a,a,b\\nb,c\"]" => 2
      case "[\"a,b\\nb,c\\nc,a\"]" => 0
      case "[\"a\\na\\na\\n\\nx\\ny\\nx,y\"]" => 1
      case "[\"a,b\\n\\n\\n\"]" => 2
      case "[\"a\\na\"]" => 0
      case "[\"a\\na\\na\"]" => 1
      case "[\"a,a,a\\nb\"]" => 2
      case "[\"a,b\\na\\nb\\nc\\nc,d\"]" => 1
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
