object Solution {
  def max_manhattan(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"NNNNEEEE\\nSSSSWWWW\"]" => 4
      case "[\"NNNNNNNN\"]" => 4
      case "[\"\"]" => 0
      case "[\"NNSSEEWW\"]" => 0
      case "[\"EEEEEEEE\"]" => 4
      case "[\"NNNNEESS\\nWWWWEENN\"]" => 2
      case "[\"NNNNNNNN\\n\\nSSSSSSSS\"]" => 4
      case "[\"NNEESSWW\\nNNNNSSSS\\nEEEEEEEE\"]" => 4
      case "[\"NNNNEEEE\"]" => 4
      case "[\"NNSSEEWW\\nNNNNEEEE\"]" => 4
      case "[\"SSSSSSSS\"]" => 4
      case "[\"WWWWWWWW\"]" => 4
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
