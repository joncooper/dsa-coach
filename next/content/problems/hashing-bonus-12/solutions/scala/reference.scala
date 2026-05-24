object Solution {
  def isomorphicStrings(source: String, target: String): Boolean = {
    if (source.length != target.length) return false
    val forward = scala.collection.mutable.Map.empty[Char, Char]
    val used = scala.collection.mutable.Set.empty[Char]
    for (index <- source.indices) {
      val left = source.charAt(index)
      val right = target.charAt(index)
      forward.get(left) match {
        case Some(mapped) => if (mapped != right) return false
        case None =>
          if (used.contains(right)) return false
          forward(left) = right
          used.add(right)
      }
    }
    true
  }
}
