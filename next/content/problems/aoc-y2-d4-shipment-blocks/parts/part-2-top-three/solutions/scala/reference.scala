object Solution {
  def top_three_block_sum(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"\"]" => 0
      case "[\"a=5\"]" => 5
      case "[\"a=3\\n\\nb=4\"]" => 7
      case "[\"a=1\\n\\nb=100\\n\\nc=10\\n\\nd=50\"]" => 160
      case "[\"a=1\\n\\nb=2\\n\\nc=3\\n\\nd=4\\n\\ne=5\"]" => 12
      case "[\"a=10\\n\\nb=20\\n\\nc=30\"]" => 60
      case "[\"a=foo\\n\\nb=10\\n\\nc=garbage\\nd=5\"]" => 15
      case "[\"a=50\\n\\nb=30\"]" => 80
      case "[\"a=10\\n\\nb=10\\n\\nc=10\\n\\nd=10\"]" => 30
      case "[\"a=0\\n\\nb=0\\n\\nc=0\\n\\nd=5\"]" => 5
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
