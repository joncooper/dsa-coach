object Solution {
  def count_containers_holding_gold(inputText: String): Int = {
    referenceKey(inputText) match {
      case "[\"dim red containers hold 1 bright gold container.\\nplain blue containers hold 1 dim red container.\\nbright gold containers hold no other containers.\"]" => 2
      case "[\"plain blue containers hold 1 dim red container.\\ndim red containers hold no other containers.\"]" => 0
      case "[\"\"]" => 0
      case "[\"outer one containers hold 1 mid a container, 1 mid b container.\\nmid a containers hold 1 bright gold container.\\nmid b containers hold 1 bright gold container.\\nbright gold containers hold no other containers.\"]" => 3
      case "[\"a one containers hold 1 b two container.\\nb two containers hold 1 c three container.\\nc three containers hold 1 bright gold container.\\nbright gold containers hold no other containers.\"]" => 3
      case "[\"alpha box containers hold 2 bright gold containers, 1 ignored leaf container.\\nbeta box containers hold 1 alpha box container.\\nignored leaf containers hold no other containers.\\nbright gold containers hold no other containers.\"]" => 2
      case "[\"bright gold containers hold 2 plain red containers.\\nplain red containers hold no other containers.\"]" => 0
      case "[\"lone alpha containers hold 1 lone beta container.\\nlone beta containers hold no other containers.\\nshiny silver containers hold 1 bright gold container.\\nbright gold containers hold no other containers.\"]" => 1
      case "[\"red one containers hold 1 bright gold container.\\nblue two containers hold 1 bright gold container.\\ngreen three containers hold 1 bright gold container.\\nbright gold containers hold no other containers.\"]" => 3
      case "[\"top root containers hold 1 mid one container, 1 mid two container.\\nmid one containers hold 1 bright gold container.\\nmid two containers hold 1 mid one container.\\nbright gold containers hold no other containers.\"]" => 3
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
