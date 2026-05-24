object Solution {
  def dedupSortedList(values: Seq[Int]): Seq[Int] = {
    val result = scala.collection.mutable.ArrayBuffer.empty[Int]
    for (value <- values) {
      if (result.isEmpty || result.last != value) result.append(value)
    }
    result.toSeq
  }
}
