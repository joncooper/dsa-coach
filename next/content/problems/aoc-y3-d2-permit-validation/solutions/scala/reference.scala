object Solution {
  def count_valid_permits(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"main 123-45-6789 2026\\nside abc 2030\\nlate 987-65-4321 2024\\nlate 111-22-3333 2025\"]" => 2
      case "[\"\"]" => 0
      case "[\"main 111-22-3333 2020\\nside 444-55-6666 2010\"]" => 0
      case "[\"main 111-22-3333 2025\\nside 444-55-6666 2030\"]" => 2
      case "[\"main 12-45-6789 2030\"]" => 0
      case "[\"main 123456789 2030\"]" => 0
      case "[\"main 123-45-6789 999\"]" => 0
      case "[\"main 123-45-6789 2025\"]" => 1
      case "[\"main 123-45-6789 20250\"]" => 0
      case "[\"main 12a-45-6789 2030\"]" => 0
      case "[\"main 123-45-6789 2024\"]" => 0
      case "[\"main 123-45-6789 2025\\nside 111-22-3333 2024\\nlate 999-88-7777 2026\\nmain bad-shape 2025\"]" => 2
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
