object Solution {
  def distinctPermutations(nums: Seq[Int]): Seq[Seq[Int]] = {
    val ordered = nums.sorted
    val result = scala.collection.mutable.ArrayBuffer.empty[Seq[Int]]
    val used = Array.fill(ordered.length)(false)
    val current = scala.collection.mutable.ArrayBuffer.empty[Int]
    def backtrack(): Unit = {
      if (current.length == ordered.length) { result.append(current.toSeq); return }
      for (index <- ordered.indices) if (!used(index) && !(index > 0 && ordered(index) == ordered(index - 1) && !used(index - 1))) {
        used(index) = true; current.append(ordered(index)); backtrack(); current.remove(current.length - 1); used(index) = false
      }
    }
    backtrack()
    result.toSeq
  }
}
