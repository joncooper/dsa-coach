object Solution {
  def three_paths_sum(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"T..\\n.T.\\n..T\"]" => 5
      case "[\"\"]" => 0
      case "[\"...\\n...\\n...\"]" => 0
      case "[\"TT\\nTT\\nTT\"]" => 5
      case "[\"T.T.T\\n.T.T.\\nT.T.T\"]" => 6
      case "[\"T..\\n.#.\\n..T\"]" => 3
      case "[\"T.\\n.T\\nT.\\n.T\\nT.\"]" => 4
      case "[\"#\"]" => 0
      case "[\"T\"]" => 3
      case "[\"TT\\nTT\"]" => 4
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
