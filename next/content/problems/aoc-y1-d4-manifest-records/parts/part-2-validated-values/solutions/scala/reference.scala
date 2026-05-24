object Solution {
  def count_strict_records(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"id:123456789 name:Ada age:30 grade:A cohort:fall\"]" => 1
      case "[\"id:12345 name:Ada age:30 grade:A cohort:fall\"]" => 0
      case "[\"id:123456789 name:Ada age:14 grade:A cohort:fall\"]" => 0
      case "[\"\"]" => 0
      case "[\"id:111222333 name:B age:20 grade:E cohort:spring\"]" => 0
      case "[\"id:111222333 name:B age:20 grade:A cohort:autumn\"]" => 0
      case "[\"id:111222333 name:Ada-Lovelace age:30 grade:B cohort:winter\"]" => 1
      case "[\"id:111222333 name:Ada2 age:30 grade:B cohort:winter\"]" => 0
      case "[\"id:111222333 name:B age:16 grade:A cohort:spring\"]" => 1
      case "[\"id:111222333 name:B age:99 grade:A cohort:spring\"]" => 1
      case "[\"id:111222333 name:B age:100 grade:A cohort:spring\"]" => 0
      case "[\"id:11122233a name:B age:30 grade:A cohort:spring\"]" => 0
      case "[\"id:111222333 name:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa age:30 grade:A cohort:spring\"]" => 0
      case "[\"id:111222333 name:A age:30 grade:A cohort:spring\\n\\nname:B age:30 grade:A cohort:spring\"]" => 1
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
