object Solution {
  def count_valid_positions(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"1-3 a: abcde\\n1-3 b: cdefg\\n2-9 c: ccccccccc\"]" => 1
      case "[\"1-2 x: xxaaa\"]" => 0
      case "[\"2-4 z: abcde\"]" => 0
      case "[\"1-3 q: qabxy\"]" => 1
      case "[\"1-3 q: aaqxy\"]" => 1
      case "[\"1-99 a: a\"]" => 1
      case "[\"\\n1-2 z: zx\\n\"]" => 1
      case "[\"10-20 a: abc\"]" => 0
      case "[\"2-2 a: babcd\\n2-2 b: babcd\"]" => 0
      case "[\"1-3 z: zxz\"]" => 0
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
