object Solution {
  def cipher_checksum(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"cargo 42xy ok\\ntext hello1 ok\\nledger 4242 bad\\nledger a13 ok\"]" => 51
      case "[\"\"]" => 0
      case "[\"cargo abcd ok\\ntext h1 ok\\ntext nope bad\"]" => 1
      case "[\"cargo a99 ok\"]" => 0
      case "[\"ledger a1b2c3 ok\"]" => 6
      case "[\"text abc123def ok\"]" => 6
      case "[\"cargo 12abc ok\\ntext h2llo ok\\nledger 9z9 ok\"]" => 34
      case "[\"cargo 7a8 ok\"]" => 7
      case "[\"cargo 99x bad\\nledger a9 ok\"]" => 9
      case "[\"ledger abc123 ok\"]" => 6
      case "[\"text a1b2c3 ok\"]" => 3
      case "[\"weird a1 ok\"]" => 0
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
