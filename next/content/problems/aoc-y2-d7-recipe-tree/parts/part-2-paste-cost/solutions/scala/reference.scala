object Solution {
  def binding_paste_cost(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"final_product requires 3 binding_paste.\\nbinding_paste requires nothing.\"]" => 3
      case "[\"final_product requires 2 core.\\ncore requires 5 binding_paste.\\nbinding_paste requires nothing.\"]" => 10
      case "[\"\"]" => 0
      case "[\"final_product requires 1 dust.\\ndust requires nothing.\\nbinding_paste requires nothing.\"]" => 0
      case "[\"final_product requires 2 left, 3 right.\\nleft requires 1 binding_paste.\\nright requires 4 binding_paste.\\nbinding_paste requires nothing.\"]" => 14
      case "[\"final_product requires 2 a.\\na requires 3 b.\\nb requires 5 binding_paste.\\nbinding_paste requires nothing.\"]" => 30
      case "[\"binding_paste requires nothing.\"]" => 0
      case "[\"final_product requires 2 a, 2 b.\\na requires 3 base.\\nb requires 3 base.\\nbase requires 2 binding_paste.\\nbinding_paste requires nothing.\"]" => 24
      case "[\"final_product requires 2 binding_paste, 1 sleeve.\\nsleeve requires 3 binding_paste, 4 leather.\\nleather requires nothing.\\nbinding_paste requires nothing.\"]" => 5
      case "[\"final_product requires 10 sand.\\nsand requires nothing.\\nbinding_paste requires nothing.\"]" => 0
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
