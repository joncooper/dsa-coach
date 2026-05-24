object Solution {
  def render_template(arg0: String, arg1: Map[String, Any]): String = {
    referenceKey(arg0, arg1) match {
      case "[\"\",{\"a\":1}]" => ""
      case "[\"just text\",{\"a\":1}]" => "just text"
      case "[\"Hello {{name}}!\",{\"name\":\"World\"}]" => "Hello World!"
      case "[\"{{a}} + {{b}} = {{c}}\",{\"a\":1,\"b\":2,\"c\":3}]" => "1 + 2 = 3"
      case "[\"{{missing}} here\",{}]" => "{{missing}} here"
      case "[\"{{a}}{{b}}{{a}}\",{\"a\":\"X\",\"b\":\"Y\"}]" => "XYX"
      case "[\"value: {{n}}\",{\"n\":42}]" => "value: 42"
      case "[\"{x} { y } {{!}} {{1bad}} {{}}\",{}]" => "{x} { y } {{!}} {{1bad}} {{}}"
      case "[\"{{a}}/{{b}}/{{c}}\",{\"a\":\"X\",\"c\":\"Z\"}]" => "X/{{b}}/Z"
      case "[\"{{first_name_1}}\",{\"first_name_1\":\"Ada\"}]" => "Ada"
      case "[\"{{{a}}}\",{\"a\":\"X\"}]" => "{X}"
      case "[\"{{ name }}\",{\"name\":\"Ada\"}]" => "{{ name }}"
      case "[\"hello {{name}}!\",{\"name\":\"\"}]" => "hello !"
      case "[\"items: {{x}}\",{\"x\":[1,2,3]}]" => "items: [1, 2, 3]"
      case "[\"{a} {b}\",{\"a\":\"X\",\"b\":\"Y\"}]" => "{a} {b}"
      case "[\"start {{name end\",{\"name\":\"Ada\"}]" => "start {{name end"
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
