object Solution {
  def max_manhattan(inputText: String): Int = {
    var best = 0

    for (line <- inputText.linesIterator.map(_.trim).filter(_.nonEmpty)) {
      var row = 0
      var col = 0
      for (i <- line.indices by 2) {
        val (dr, dc) = step(line.slice(i, i + 2))
        row += dr
        col += dc
      }
      best = math.max(best, math.abs(row) + math.abs(col))
    }

    best
  }

  private def step(pair: String): (Int, Int) = pair match {
    case "NN" => (1, 0)
    case "SS" => (-1, 0)
    case "EE" => (0, 1)
    case _ => (0, -1)
  }
}
