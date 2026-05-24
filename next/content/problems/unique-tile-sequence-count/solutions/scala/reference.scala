object Solution {
  def uniqueTileSequenceCount(tiles: String): Int = {
    val counts = scala.collection.mutable.Map.empty[Char, Int].withDefaultValue(0)
    for (tile <- tiles) counts(tile) += 1
    val letters = counts.keys.toSeq.sorted
    def dfs(): Int = {
      var total = 0
      for (letter <- letters if counts(letter) > 0) {
        counts(letter) -= 1
        total += 1 + dfs()
        counts(letter) += 1
      }
      total
    }
    dfs()
  }
}
