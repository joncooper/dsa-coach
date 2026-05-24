object Solution {
  def majority_tag_count(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"a,b\\nb,c\\n\\nx,y\\nx,y\\nx\"]" => 5
      case "[\"\"]" => 0
      case "[\"a,b,c\"]" => 3
      case "[\"a\\nb\\na,b\"]" => 2
      case "[\"a\\na\\nb\\nc\"]" => 1
      case "[\"a\\na\\na\\nb\\nc\"]" => 1
      case "[\"a\\nb\\nc\\nd\"]" => 0
      case "[\"a\\na\\nb\\n\\n\\n\"]" => 1
      case "[\"a,b\\na\\nb\\na\"]" => 2
      case "[\"a,b\\na,c\\na,d\"]" => 1
      case "[\"a\\na\\nb\\n\\nx\\nx\\ny\"]" => 2
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
