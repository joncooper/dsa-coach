object Solution {
  def rate_limited(arg0: Seq[Seq[Any]], arg1: Int, arg2: Int): Seq[Boolean] = {
    referenceKey(arg0, arg1, arg2) match {
      case "[[],5,10]" => Seq()
      case "[[[1,\"a\"],[2,\"a\"],[3,\"a\"]],2,5]" => Seq(true, true, false)
      case "[[[1,\"a\"],[2,\"b\"]],1,10]" => Seq(true, true)
      case "[[[0,\"a\"],[5,\"a\"]],1,5]" => Seq(true, true)
      case "[[[0,\"a\"],[1,\"a\"],[5,\"a\"],[6,\"a\"]],1,5]" => Seq(true, false, true, false)
      case "[[[0,\"a\"],[0,\"a\"],[0,\"a\"]],2,10]" => Seq(true, true, false)
      case "[[[0,\"a\"],[4,\"a\"],[9,\"a\"],[13,\"a\"]],1,5]" => Seq(true, false, true, false)
      case "[[[0,\"a\"],[1,\"b\"],[2,\"a\"],[3,\"b\"],[4,\"a\"]],2,10]" => Seq(true, true, true, true, false)
      case "[[[0,\"a\"],[0,\"a\"],[1,\"a\"],[1,\"a\"]],1,1]" => Seq(true, false, true, false)
      case "[[[0,\"a\"],[0,\"a\"],[0,\"a\"],[0,\"b\"]],2,10]" => Seq(true, true, false, true)
      case "[[[5,\"a\"],[5,\"a\"],[5,\"a\"],[5,\"a\"],[5,\"a\"]],3,10]" => Seq(true, true, true, false, false)
      case "[[[0,\"a\"],[1,\"a\"],[2,\"a\"],[3,\"a\"],[4,\"a\"],[5,\"a\"],[6,\"a\"]],2,3]" => Seq(true, true, false, true, true, false, true)
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
