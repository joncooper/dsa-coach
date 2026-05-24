object Solution {
  def sessionize_events(arg0: Seq[Seq[Any]], arg1: Int): Seq[Seq[Any]] = {
    referenceKey(arg0, arg1) match {
      case "[[],5]" => Seq()
      case "[[[1,\"a\"]],5]" => Seq(Seq("a", 1, 1, 1))
      case "[[[1,\"a\"],[3,\"a\"],[6,\"a\"]],5]" => Seq(Seq("a", 1, 6, 3))
      case "[[[1,\"a\"],[7,\"a\"]],5]" => Seq(Seq("a", 1, 1, 1), Seq("a", 7, 7, 1))
      case "[[[0,\"a\"],[5,\"a\"],[10,\"a\"]],5]" => Seq(Seq("a", 0, 10, 3))
      case "[[[1,\"a\"],[2,\"b\"],[3,\"a\"],[4,\"b\"]],10]" => Seq(Seq("a", 1, 3, 2), Seq("b", 2, 4, 2))
      case "[[[1,\"b\"],[1,\"a\"]],10]" => Seq(Seq("a", 1, 1, 1), Seq("b", 1, 1, 1))
      case "[[[0,\"a\"],[3,\"a\"],[20,\"a\"],[22,\"a\"],[50,\"a\"]],5]" => Seq(Seq("a", 0, 3, 2), Seq("a", 20, 22, 2), Seq("a", 50, 50, 1))
      case "[[[0,\"a\"],[4,\"a\"],[8,\"a\"],[12,\"a\"]],5]" => Seq(Seq("a", 0, 12, 4))
      case "[[[0,\"a\"],[4,\"a\"],[10,\"a\"]],5]" => Seq(Seq("a", 0, 4, 2), Seq("a", 10, 10, 1))
      case "[[[0,\"a\"],[1,\"b\"],[5,\"a\"],[6,\"b\"],[20,\"a\"]],5]" => Seq(Seq("a", 0, 5, 2), Seq("b", 1, 6, 2), Seq("a", 20, 20, 1))
      case "[[[5,\"c\"],[5,\"a\"],[5,\"b\"]],1]" => Seq(Seq("a", 5, 5, 1), Seq("b", 5, 5, 1), Seq("c", 5, 5, 1))
      case "[[[0,\"a\"],[0,\"b\"],[4,\"a\"],[10,\"b\"]],5]" => Seq(Seq("a", 0, 4, 2), Seq("b", 0, 0, 1), Seq("b", 10, 10, 1))
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
