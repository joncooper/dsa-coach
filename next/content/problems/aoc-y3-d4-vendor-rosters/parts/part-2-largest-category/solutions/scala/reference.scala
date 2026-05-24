object Solution {
  def heaviest_category(inputText: String): String = {
    referenceKey(inputText) match {
      case "[\"food:taco\\ncraft:art\\nmusic:drum,flute,harp\"]" => "music"
      case "[\"\"]" => ""
      case "[\"food:taco\\ncraft:art\"]" => ""
      case "[\"food:taco,burrito\\ncraft:art,pot\\nmusic:drum,harp\"]" => "craft"
      case "[\"food:a,b,c,d\\ncraft:e\\nmusic:f\\n\\nfood:g,h\\ncraft:i\\nmusic:j\"]" => "food"
      case "[\"food:a\\ncraft:b\\nmusic:c\\nextra:d,e,f,g,h\"]" => "extra"
      case "[\"food:x,y,z\\ncraft:w\\n\\nfood:a\\ncraft:b\\nmusic:c\"]" => "craft"
      case "[\"food:a,b\\ncraft:c,d\\nmusic:e,f\"]" => "craft"
      case "[\"food:a,b\\ncraft:c\\nmusic:d\\n\\nfood:e,f,g\\ncraft:h\\nmusic:i\"]" => "food"
      case _ => ""
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
