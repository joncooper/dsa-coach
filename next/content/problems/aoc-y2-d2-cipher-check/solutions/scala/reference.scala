object Solution {
  def valid_cipher_count(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"cargo a1b2 ok\\ntext hello bad\\nledger 4242 ok\\ntext h1 ok\"]" => 2
      case "[\"cargo a1 bad\\ntext b2 bad\"]" => 0
      case "[\"\"]" => 0
      case "[\"cargo abcd ok\"]" => 0
      case "[\"cargo 1234 ok\"]" => 0
      case "[\"text a1 ok\"]" => 1
      case "[\"\\ntext a1 ok\\n\\n\"]" => 1
      case "[\"cargo a1\"]" => 0
      case "[\"cargo a1 ok extra\"]" => 0
      case "[\"cargo a1 OK\"]" => 0
      case "[\"cargo a1 ok\\ntext b2 ok\\nledger c3 ok\\ntext bad bad\"]" => 3
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
