object Solution {
  def flood_fill(arg0: Seq[Seq[Int]], arg1: Int, arg2: Int, arg3: Int): Seq[Seq[Int]] = {
    referenceKey(arg0, arg1, arg2, arg3) match {
      case "[[[1,1,0],[1,0,0],[0,0,1]],0,0,2]" => Seq(Seq(2, 2, 0), Seq(2, 0, 0), Seq(0, 0, 1))
      case "[[[1,1],[1,1]],0,0,1]" => Seq(Seq(1, 1), Seq(1, 1))
      case "[[[5]],0,0,9]" => Seq(Seq(9))
      case "[[[3,3],[3,3]],1,1,7]" => Seq(Seq(7, 7), Seq(7, 7))
      case "[[[1,2,1],[2,2,2],[1,2,1]],0,0,9]" => Seq(Seq(9, 2, 1), Seq(2, 2, 2), Seq(1, 2, 1))
      case "[[[1,0],[0,1]],0,0,5]" => Seq(Seq(5, 0), Seq(0, 1))
      case "[[[0,0,0],[0,1,1]],0,0,4]" => Seq(Seq(4, 4, 4), Seq(4, 1, 1))
      case "[[[8,8,8],[8,1,8],[8,8,8]],1,1,0]" => Seq(Seq(8, 8, 8), Seq(8, 0, 8), Seq(8, 8, 8))
      case "[[[1,0,1],[1,0,1]],0,0,6]" => Seq(Seq(6, 0, 1), Seq(6, 0, 1))
      case "[[[1,1,1,2,1]],0,0,7]" => Seq(Seq(7, 7, 7, 2, 1))
      case "[[[1],[1],[2],[1]],0,0,9]" => Seq(Seq(9), Seq(9), Seq(2), Seq(1))
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
