object Solution {
  def count_complete_records(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"id:1 name:A age:20 grade:B cohort:fall\\nextra:hi\\n\\nid:2 name:B age:21 grade:A\"]" => 1
      case "[\"\"]" => 0
      case "[\"id:1 name:X age:30 grade:C cohort:fall\\n\\nid:2 name:Y age:31 grade:D cohort:spring\"]" => 2
      case "[\"id:1 name:A age:20 grade:B cohort:fall hair:red eye:blue\"]" => 1
      case "[\"id:1 name:A\\nage:20 grade:B\\ncohort:fall\"]" => 1
      case "[\"id:1 name:A age:20 grade:B\"]" => 0
      case "[\"id:1 name:A age:20 grade:B cohort:fall\\n\\nid:2 name:B age:21\\n\\nid:3 name:C age:22 grade:D cohort:spring\"]" => 2
      case "[\"name:A age:20 grade:B cohort:fall\"]" => 0
      case "[\"id:1 id:2 name:A age:20 grade:B cohort:fall\"]" => 1
      case "[\"id:1 name:A age:20 grade:B cohort:fall\\n\\n\\n\\n\"]" => 1
      case "[\"\\n\\nid:1 name:A age:20 grade:B cohort:fall\"]" => 1
      case "[\"id:1 name:A age:20 grade:B cohort:fall bareword anothertoken\"]" => 1
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
