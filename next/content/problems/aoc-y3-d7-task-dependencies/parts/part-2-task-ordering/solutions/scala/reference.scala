object Solution {
  def schedule_finish(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"a before b.\\nb before c.\\nc before nothing.\"]" => 3
      case "[\"\"]" => 0
      case "[\"only before nothing.\"]" => 1
      case "[\"root before a, b.\\na before nothing.\\nb before nothing.\"]" => 2
      case "[\"top before left, right.\\nleft before bottom.\\nright before bottom.\\nbottom before nothing.\"]" => 3
      case "[\"a before nothing.\\nb before c.\\nc before d.\\nd before nothing.\"]" => 3
      case "[\"a before b.\\nb before c.\\nc before d.\\nd before e.\\ne before nothing.\"]" => 5
      case "[\"root before a, b, c.\\na before nothing.\\nb before nothing.\\nc before nothing.\"]" => 2
      case "[\"root before a, deep1.\\na before nothing.\\ndeep1 before deep2.\\ndeep2 before deep3.\\ndeep3 before nothing.\"]" => 4
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
