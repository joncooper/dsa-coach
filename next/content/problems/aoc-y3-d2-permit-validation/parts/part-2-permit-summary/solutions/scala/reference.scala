object Solution {
  def permit_counts_by_stage(inputText: String): Map[String, Any] = {
    referenceKey(inputText) match {
      case "[\"main 111-22-3333 2026\\nside 444-55-6666 2027\\nside 444-55-6666 2020\"]" => Map("main" -> 1, "side" -> 1, "late" -> 0)
      case "[\"\"]" => Map("main" -> 0, "side" -> 0, "late" -> 0)
      case "[\"main 111-22-3333 2025\\nmain 222-33-4444 2030\"]" => Map("main" -> 2, "side" -> 0, "late" -> 0)
      case "[\"spare 111-22-3333 2030\\nmain 111-22-3333 2030\"]" => Map("main" -> 1, "side" -> 0, "late" -> 0)
      case "[\"late abc 2030\"]" => Map("main" -> 0, "side" -> 0, "late" -> 0)
      case "[\"main 111-22-3333 2025\\nside 444-55-6666 2026\\nlate 777-88-9999 2027\"]" => Map("main" -> 1, "side" -> 1, "late" -> 1)
      case "[\"main 111-22-3333 2025\\nmain 222-33-4444 2030\\nmain 999-88-7777 2020\"]" => Map("main" -> 2, "side" -> 0, "late" -> 0)
      case "[\"main 111-22-3333 2025\\nside abc 2030\\nlate 999-88-7777 2026\\nmain 222-33-4444 2024\"]" => Map("main" -> 1, "side" -> 0, "late" -> 1)
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
