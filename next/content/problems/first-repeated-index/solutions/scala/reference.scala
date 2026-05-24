object Solution {
  def firstRepeatedIndex(values: Seq[Int]): Int = {
    val seen = scala.collection.mutable.Set.empty[Int]
    for ((value, index) <- values.zipWithIndex) {
      if (seen.contains(value)) return index
      seen.add(value)
    }
    -1
  }
}
