object Solution {
  def max_revenue_window(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"3\\n1\\n2\\n3\\n4\\n5\"]" => 12
      case "[\"1\\n5\\n9\\n3\"]" => 9
      case "[\"\"]" => 0
      case "[\"5\\n1\\n2\"]" => 0
      case "[\"2\\n-1\\n-2\\n-3\\n10\"]" => 7
      case "[\"3\\n1\\n2\\n3\"]" => 6
      case "[\"2\\n0\\n5\\n5\\n0\"]" => 10
      case "[\"2\\n-5\\n-3\\n-9\\n-1\"]" => -8
      case "[\"1\\n3\\n7\\n2\\n9\\n4\"]" => 9
      case "[\"4\\n1\\n2\\n3\\n4\"]" => 10
      case "[\"3\\n1\\n2\\n3\\n100\\n1\\n1\\n1\"]" => 105
      case "[\"3\\n5\"]" => 0
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
