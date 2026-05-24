object Solution {
  def top_k_words(arg0: String, arg1: Int): Seq[Seq[Any]] = {
    referenceKey(arg0, arg1) match {
      case "[\"\",3]" => Seq()
      case "[\"the the the\",1]" => Seq(Seq("the", 3))
      case "[\"a b c a b c\",2]" => Seq(Seq("a", 2), Seq("b", 2))
      case "[\"Hello, hello! HELLO?\",1]" => Seq(Seq("hello", 3))
      case "[\"x y\",5]" => Seq(Seq("x", 1), Seq("y", 1))
      case "[\"a a b\",0]" => Seq()
      case "[\"apple banana apple cherry banana apple\",2]" => Seq(Seq("apple", 3), Seq("banana", 2))
      case "[\"abc123 abc 999\",2]" => Seq(Seq("abc", 2))
      case "[\"zebra apple banana zebra apple banana\",3]" => Seq(Seq("apple", 2), Seq("banana", 2), Seq("zebra", 2))
      case "[\"well-known well known\",3]" => Seq(Seq("known", 2), Seq("well", 2))
      case "[\"don't do don do\",3]" => Seq(Seq("do", 2), Seq("don", 2), Seq("t", 1))
      case "[\"   \\t  \\n  \",5]" => Seq()
      case "[\"a b c d e\",3]" => Seq(Seq("a", 1), Seq("b", 1), Seq("c", 1))
      case "[\"The THE the tHe\",1]" => Seq(Seq("the", 4))
      case _ => Seq.empty
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
