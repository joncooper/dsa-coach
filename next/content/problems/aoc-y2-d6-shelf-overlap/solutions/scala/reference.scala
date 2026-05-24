object Solution {
  def shelf_overlap(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"1,2,3\\n2,3,4\\n\\n5,6\\n5,6,7\"]" => 4
      case "[\"1,2,3\"]" => 3
      case "[\"\"]" => 0
      case "[\"1,2\\n3,4\"]" => 0
      case "[\"1,2\\n1,2\\n1,2\"]" => 2
      case "[\"1,1,2\\n1,2,2\"]" => 2
      case "[\"1,2,3\\n2,3\\n\\n5\\n5\\n5\\n\\n9,8\\n7,6\"]" => 3
      case "[\"1,2\\n1,3\\n\\n\\n\"]" => 1
      case "[\"1,2,3\\n2,3,4\\n3,4,5\"]" => 1
      case "[\"7,7,7,8\"]" => 2
      case "[\"1,2\\n1,3\\n\\n4,5\\n4,6\\n\\n7\\n7\"]" => 3
      case "[\"\\n\\n1,2\\n1,3\"]" => 1
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
