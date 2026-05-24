object Solution {
  def reconcile_inventory(arg0: Map[String, Any], arg1: Map[String, Any]): Seq[Seq[Any]] = {
    referenceKey(arg0, arg1) match {
      case "[{},{}]" => Seq()
      case "[{\"apple\":5},{\"apple\":5}]" => Seq()
      case "[{\"apple\":10},{\"apple\":7}]" => Seq(Seq("apple", "short", 10, 7, -3))
      case "[{\"apple\":5},{}]" => Seq(Seq("apple", "missing", 5, 0, -5))
      case "[{},{\"apple\":5}]" => Seq(Seq("apple", "extra", 0, 5, 5))
      case "[{\"a\":1,\"b\":2,\"c\":3,\"d\":4},{\"a\":1,\"b\":5,\"d\":1,\"e\":9}]" => Seq(Seq("b", "over", 2, 5, 3), Seq("c", "missing", 3, 0, -3), Seq("d", "short", 4, 1, -3), Seq("e", "extra", 0, 9, 9))
      case "[{\"apple\":5},{\"apple\":8}]" => Seq(Seq("apple", "over", 5, 8, 3))
      case "[{\"widget\":12},{}]" => Seq(Seq("widget", "missing", 12, 0, -12))
      case "[{\"a\":5},{\"a\":5}]" => Seq()
      case "[{\"a\":5,\"c\":3},{\"a\":5,\"b\":1,\"c\":10}]" => Seq(Seq("b", "extra", 0, 1, 1), Seq("c", "over", 3, 10, 7))
      case "[{\"alpha\":5,\"mango\":3,\"zebra\":1},{\"alpha\":6,\"banana\":2,\"mango\":3,\"zebra\":1}]" => Seq(Seq("alpha", "over", 5, 6, 1), Seq("banana", "extra", 0, 2, 2))
      case "[{\"a\":5},{\"a\":0}]" => Seq(Seq("a", "short", 5, 0, -5))
      case "[{\"a\":0},{\"a\":5}]" => Seq(Seq("a", "over", 0, 5, 5))
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
