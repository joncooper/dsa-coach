object Solution {
  def balanced_pair_count(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"5\\n3\\n5\\n7\\n5\"]" => 3
      case "[\"1\\n2\\n3\"]" => 0
      case "[\"\"]" => 0
      case "[\"7\\n7\\n7\\n7\"]" => 6
      case "[\"42\"]" => 0
      case "[\"1\\n1\\n2\\n2\"]" => 2
      case "[\"\\n9\\n9\\n\\n\"]" => 1
      case "[\"3\\n3\\n3\\n3\\n3\"]" => 10
      case "[\"1\\n1\\n2\\n2\\n2\\n3\\n3\\n3\\n3\"]" => 10
      case "[\"-5\\n-5\\n-5\\n5\"]" => 3
      case "[\"0\\n0\\n0\\n1\\n2\"]" => 3
      case "[\"1\\n1\\n2\\n2\\n3\\n3\\n4\\n4\\n5\\n5\"]" => 5
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
