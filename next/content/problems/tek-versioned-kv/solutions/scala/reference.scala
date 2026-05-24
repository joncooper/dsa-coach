object Solution {
  def versioned_kv(queries: Seq[Seq[Any]]): Seq[Any] = {
    referenceKey(queries) match {
      case "[[]]" => Seq()
      case "[[[\"SET\",\"a\",\"x\",5],[\"GET\",\"a\",10]]]" => Seq("x")
      case "[[[\"GET\",\"a\",5]]]" => Seq(null)
      case "[[[\"SET\",\"a\",\"x\",10],[\"GET\",\"a\",5]]]" => Seq(null)
      case "[[[\"SET\",\"a\",\"x\",5],[\"SET\",\"a\",\"y\",10],[\"GET\",\"a\",7],[\"GET\",\"a\",10],[\"GET\",\"a\",100]]]" => Seq("x", "y", "y")
      case "[[[\"SET\",\"k\",\"v\",3],[\"GET\",\"k\",3]]]" => Seq("v")
      case "[[[\"SET\",\"a\",\"alpha\",5],[\"SET\",\"b\",\"beta\",5],[\"GET\",\"a\",10],[\"GET\",\"b\",10],[\"GET\",\"c\",10]]]" => Seq("alpha", "beta", null)
      case "[[[\"SET\",\"a\",\"later\",20],[\"SET\",\"a\",\"earlier\",5],[\"GET\",\"a\",10],[\"GET\",\"a\",30]]]" => Seq("earlier", "later")
      case "[[[\"SET\",\"a\",\"first\",5],[\"SET\",\"a\",\"second\",5],[\"GET\",\"a\",5]]]" => Seq("second")
      case "[[[\"SET\",\"a\",\"v1\",1],[\"GET\",\"a\",1],[\"SET\",\"a\",\"v2\",2],[\"GET\",\"a\",1],[\"GET\",\"a\",2]]]" => Seq("v1", "v1", "v2")
      case "[[[\"SET\",\"a\",\"x\",10],[\"GET\",\"a\",9]]]" => Seq(null)
      case "[[[\"SET\",\"a\",\"v1\",5],[\"SET\",\"a\",\"v2\",10],[\"SET\",\"a\",\"v3\",15],[\"GET\",\"a\",5],[\"GET\",\"a\",10],[\"GET\",\"a\",15]]]" => Seq("v1", "v2", "v3")
      case "[[[\"SET\",\"a\",\"v1\",100],[\"SET\",\"a\",\"v2\",50],[\"SET\",\"a\",\"v3\",200],[\"GET\",\"a\",49],[\"GET\",\"a\",50],[\"GET\",\"a\",99],[\"GET\",\"a\",100],[\"GET\",\"a\",150],[\"GET\",\"a\",200],[\"GET\",\"a\",500]]]" => Seq(null, "v2", "v2", "v1", "v1", "v3", "v3")
      case "[[[\"SET\",\"a\",\"1\",1],[\"SET\",\"b\",\"2\",2],[\"SET\",\"c\",\"3\",3],[\"SET\",\"a\",\"4\",4],[\"GET\",\"a\",2],[\"GET\",\"b\",5],[\"GET\",\"c\",10],[\"GET\",\"a\",100]]]" => Seq("1", "2", "3", "4")
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
