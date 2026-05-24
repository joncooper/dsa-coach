object Solution {
  def partitionLabelsLocal(text: String): Seq[Int] = {
    val last = text.zipWithIndex.toMap
    val parts = scala.collection.mutable.ArrayBuffer.empty[Int]
    var start = 0
    var end = 0
    for (index <- text.indices) {
      end = math.max(end, last(text(index)))
      if (index == end) { parts.append(end - start + 1); start = index + 1 }
    }
    parts.toSeq
  }
}
