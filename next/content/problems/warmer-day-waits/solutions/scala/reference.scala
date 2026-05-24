object Solution {
  def warmerDayWaits(temperatures: Seq[Int]): Seq[Int] = {
    val waits = Array.fill(temperatures.length)(0)
    val stack = scala.collection.mutable.ArrayBuffer.empty[Int]
    for (day <- temperatures.indices) {
      while (stack.nonEmpty && temperatures(day) > temperatures(stack.last)) {
        val previous = stack.remove(stack.length - 1)
        waits(previous) = day - previous
      }
      stack.append(day)
    }
    waits.toSeq
  }
}
