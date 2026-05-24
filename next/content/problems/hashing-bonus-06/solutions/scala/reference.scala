object Solution {
  def symmetricDifferenceSize(a: Seq[Int], b: Seq[Int]): Int = {
    val left = a.toSet
    val right = b.toSet
    ((left -- right) ++ (right -- left)).size
  }
}
