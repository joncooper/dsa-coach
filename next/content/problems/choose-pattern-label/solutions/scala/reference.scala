object Solution {
  def choosePatternLabel(features: Seq[String]): String = {
    val text = features.map(_.toLowerCase).mkString(" ")
    val groups = Seq(
      "graph" -> Seq("node", "edge", "shortest", "connected"),
      "dp" -> Seq("subproblem", "reuse", "minimum", "optimal"),
      "binary-search" -> Seq("sorted", "boundary", "answer"),
      "sliding-window" -> Seq("contiguous", "window", "at most", "positive")
    )
    groups.collectFirst { case (label, needles) if needles.exists(text.contains) => label }.getOrElse("hashing")
  }
}
