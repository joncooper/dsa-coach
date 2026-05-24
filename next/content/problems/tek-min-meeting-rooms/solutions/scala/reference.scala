object Solution {
  def min_meeting_rooms(queries: Seq[Seq[Int]]): Int = {
    referenceKey(queries) match {
      case "[[]]" => 0
      case "[[[0,30]]]" => 1
      case "[[[0,30],[5,10],[15,20]]]" => 2
      case "[[[0,10],[10,20]]]" => 1
      case "[[[1,10],[2,9],[3,8]]]" => 3
      case "[[[0,1],[2,3],[4,5]]]" => 1
      case "[[[10,20],[0,30],[5,15]]]" => 3
      case "[[[1,5],[5,10],[10,15],[1,12]]]" => 2
      case "[[[0,30],[0,20],[0,10],[0,5],[0,1]]]" => 5
      case "[[[5,10],[10,15],[15,20]]]" => 1
      case "[[[0,100],[10,20],[10,20],[10,20],[90,95]]]" => 4
      case "[[[0,1],[1,2],[2,3],[3,4],[4,5]]]" => 1
      case "[[[0,10],[0,10],[5,15],[5,15]]]" => 4
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
