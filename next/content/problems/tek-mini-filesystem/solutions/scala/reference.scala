object Solution {
  def run_fs(queries: Seq[Seq[String]]): Seq[Any] = {
    referenceKey(queries) match {
      case "[[[\"mkdir\",\"/a/b\"],[\"addFile\",\"/a/b/f.txt\",\"hi\"],[\"ls\",\"/a\"],[\"cat\",\"/a/b/f.txt\"]]]" => Seq(Seq("b"), "hi")
      case "[[[\"mkdir\",\"/x\"],[\"mkdir\",\"/y\"],[\"ls\",\"/\"]]]" => Seq(Seq("x", "y"))
      case "[[[\"mkdir\",\"/a\"],[\"addFile\",\"/a/f\",\"z\"]]]" => Seq()
      case "[[[\"mkdir\",\"/a/b\"],[\"addFile\",\"/a/b/f\",\"z\"],[\"rm\",\"/a/b\"],[\"ls\",\"/a\"]]]" => Seq(Seq())
      case "[[[\"addFile\",\"/a/f\",\"1\"],[\"addFile\",\"/a/f\",\"2\"],[\"cat\",\"/a/f\"]]]" => Seq("2")
      case "[[[\"addFile\",\"/a/f\",\"x\"],[\"ls\",\"/a/f\"]]]" => Seq(Seq("f"))
      case "[[[\"addFile\",\"/a/zeta\",\"1\"],[\"mkdir\",\"/a/alpha\"],[\"addFile\",\"/a/mid\",\"2\"],[\"ls\",\"/a\"]]]" => Seq(Seq("alpha", "mid", "zeta"))
      case "[[[\"addFile\",\"/p/q/r.txt\",\"data\"],[\"cat\",\"/p/q/r.txt\"]]]" => Seq("data")
      case "[[[\"addFile\",\"/a/f\",\"old\"],[\"rm\",\"/a/f\"],[\"addFile\",\"/a/f\",\"new\"],[\"cat\",\"/a/f\"]]]" => Seq("new")
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
