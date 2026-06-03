object Solution {
  def insertMaintenanceWindow(
      blocks: Seq[Seq[Int]],
      newBlock: Seq[Int]
  ): Seq[Seq[Int]] = {
    val ordered = (blocks :+ newBlock).sortBy(block => (block(0), block(1)))
    val merged = scala.collection.mutable.ArrayBuffer.empty[(Int, Int)]

    for (block <- ordered) {
      val start = block(0)
      val end = block(1)

      if (merged.isEmpty || start > merged.last._2) {
        merged.append((start, end))
      } else {
        val (lastStart, lastEnd) = merged.last
        merged.update(merged.length - 1, (lastStart, math.max(lastEnd, end)))
      }
    }

    merged.map { case (start, end) => Seq(start, end) }.toSeq
  }
}
