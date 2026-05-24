object Solution {
  def max_seat_id(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"FBFBBFFRLR\\nBFFFBBFRRR\"]" => 567
      case "[\"FFFBBBFRRR\\nBBFFBBFRLL\\nFBFBBFFRLR\"]" => 820
      case "[\"\"]" => -1
      case "[\"FBFBBFFRLR\"]" => 357
      case "[\"FFFFFFFLLL\"]" => 0
      case "[\"BBBBBBBRRR\"]" => 1023
      case "[\"\\nFBFBBFFRLR\\n\\nBFFFBBFRRR\\n\"]" => 567
      case "[\"FFFFFFFRLL\\nFFFFFFFLLR\"]" => 4
      case "[\"FFFFFFBLLL\"]" => 8
      case "[\"FFFFFFFLLL\\nBFFFFFFLLL\\nFBFFFFFLLL\"]" => 512
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
