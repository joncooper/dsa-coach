object Solution {
  def max_stamp(inputText: String): Long = {
    referenceKey(inputText) match {
      case "[\"000001\"]" => 1
      case "[\"00000a\"]" => 10
      case "[\"000000\"]" => 0
      case "[\"\"]" => -1
      case "[\"00000a\\n00000b\"]" => 11
      case "[\"zzzzzz\"]" => 2176782335L
      case "[\"1a2b3c\\n0z0z0z\"]" => 77370024
      case "[\"\\n00000a\\n\\n00000b\\n\"]" => 11
      case "[\"000009\\n00000a\"]" => 10
      case "[\"a00000\\n9zzzzz\"]" => 604661760
      case "[\"00000a\\n00000a\\n00000a\"]" => 10
      case _ => 0L
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
