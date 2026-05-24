object Solution {
  def subsetsLexicographic(nums: Seq[Int]): Seq[Seq[Int]] = {
    val ordered = nums.sorted
    val result = scala.collection.mutable.ArrayBuffer.empty[Seq[Int]]
    val path = scala.collection.mutable.ArrayBuffer.empty[Int]
    def backtrack(start: Int): Unit = {
      result.append(path.toSeq)
      for (index <- start until ordered.length) {
        path.append(ordered(index))
        backtrack(index + 1)
        path.remove(path.length - 1)
      }
    }
    backtrack(0)
    result.toSeq
  }
}
