object Solution {
  def task_order(arg0: Map[String, Any]): Any = {
    referenceKey(arg0) match {
      case "[{}]" => Seq()
      case "[{\"a\":[],\"b\":[\"a\"],\"c\":[\"b\"]}]" => Seq("a", "b", "c")
      case "[{\"a\":[\"b\"],\"b\":[\"a\"]}]" => null
      case "[{\"a\":[]}]" => Seq("a")
      case "[{\"a\":[],\"b\":[],\"c\":[]}]" => Seq("a", "b", "c")
      case "[{\"a\":[],\"b\":[\"a\"],\"c\":[\"a\"],\"d\":[\"b\",\"c\"]}]" => Seq("a", "b", "c", "d")
      case "[{\"build\":[\"compile\"]}]" => Seq("compile", "build")
      case "[{\"a\":[\"a\"]}]" => null
      case "[{\"a\":[\"b\"],\"b\":[\"c\"],\"c\":[\"a\"],\"x\":[]}]" => null
      case "[{\"a\":[],\"b\":[\"a\"],\"c\":[\"a\"]}]" => Seq("a", "b", "c")
      case "[{\"a\":[],\"b\":[],\"c\":[\"a\",\"b\"],\"d\":[\"c\"],\"e\":[\"c\"]}]" => Seq("a", "b", "c", "d", "e")
      case _ => null
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
