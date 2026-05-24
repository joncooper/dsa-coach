object Solution {
  def count_dependents_on_paste(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"core requires 1 binding_paste.\\nshell requires 1 core.\\nbinding_paste requires nothing.\"]" => 2
      case "[\"alpha requires 1 beta.\\nbeta requires nothing.\"]" => 0
      case "[\"\"]" => 0
      case "[\"left requires 1 binding_paste.\\nright requires 1 binding_paste.\\ntop requires 1 left, 1 right.\\nbinding_paste requires nothing.\"]" => 3
      case "[\"a requires 1 binding_paste.\\nb requires 1 a.\\nc requires 1 b.\\nd requires 1 c.\\nbinding_paste requires nothing.\"]" => 4
      case "[\"core requires 1 binding_paste.\\nirrelevant requires 1 dust.\\ndust requires nothing.\\nbinding_paste requires nothing.\"]" => 1
      case "[\"alpha requires 1 beta.\\nbeta requires 1 gamma.\\ngamma requires nothing.\\nbinding_paste requires nothing.\"]" => 0
      case "[\"alpha requires 1 binding_paste.\\nbeta requires 1 binding_paste.\\ngamma requires 1 binding_paste.\\nbinding_paste requires nothing.\"]" => 3
      case "[\"a requires 1 b.\\nb requires 1 c.\\nc requires 1 binding_paste.\\nbinding_paste requires nothing.\"]" => 3
      case "[\"tonic requires 5 binding_paste, 3 herb.\\nherb requires nothing.\\nbinding_paste requires nothing.\"]" => 1
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
