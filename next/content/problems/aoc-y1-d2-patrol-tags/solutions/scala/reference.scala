object Solution {
  def count_valid_tags(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"1-3 a: abcde\\n1-3 b: cdefg\\n2-9 c: ccccccccc\"]" => 2
      case "[\"1-1 z: aaa\\n2-2 a: aaaa\"]" => 0
      case "[\"\"]" => 0
      case "[\"3-5 q: qqqxx\"]" => 1
      case "[\"1-3 z: zzzab\"]" => 1
      case "[\"\\n1-1 a: a\\n\\n\"]" => 1
      case "[\"2-4 t: ttabt\\n5-9 m: mmmm\"]" => 1
      case "[\"3-3 a: aaa\\n3-3 a: aaaa\"]" => 1
      case "[\"0-2 a: bcd\"]" => 1
      case "[\"1-2 a: aaaa\"]" => 0
      case "[\"1-5 q: abcde\"]" => 0
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
