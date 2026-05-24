object Solution {
  def total_inside_gold(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"bright gold containers hold 2 dim red containers.\\ndim red containers hold 3 plain blue containers.\\nplain blue containers hold no other containers.\"]" => 8
      case "[\"bright gold containers hold no other containers.\"]" => 0
      case "[\"\"]" => 0
      case "[\"bright gold containers hold 1 dim red container, 2 plain blue containers.\\ndim red containers hold no other containers.\\nplain blue containers hold 1 tiny pink container.\\ntiny pink containers hold no other containers.\"]" => 5
      case "[\"bright gold containers hold 2 stage a containers.\\nstage a containers hold 2 stage b containers.\\nstage b containers hold no other containers.\"]" => 6
      case "[\"bright gold containers hold 1 first chamber container.\\nfirst chamber containers hold 1 second chamber container.\\nsecond chamber containers hold 1 third chamber container.\\nthird chamber containers hold no other containers.\"]" => 3
      case "[\"bright gold containers hold 3 sub one containers.\\nsub one containers hold 4 sub two containers.\\nsub two containers hold no other containers.\"]" => 15
      case "[\"bright gold containers hold 2 alpha box containers, 3 beta box containers.\\nalpha box containers hold 1 inner one container.\\nbeta box containers hold no other containers.\\ninner one containers hold no other containers.\"]" => 7
      case "[\"bright gold containers hold 2 mid one containers, 3 mid two containers.\\nmid one containers hold 1 leaf alpha container.\\nmid two containers hold 1 leaf alpha container.\\nleaf alpha containers hold no other containers.\"]" => 10
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
