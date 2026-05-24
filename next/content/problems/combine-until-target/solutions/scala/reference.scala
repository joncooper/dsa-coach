object Solution {
  def combineUntilTarget(values: Seq[Int], target: Int): Int = {
    var heap = values.sorted
    var combines = 0
    while (heap.nonEmpty && heap.head < target) {
      if (heap.length < 2) return -1
      val small = heap.head; val large = heap(1)
      heap = (heap.drop(2) :+ (small + 2 * large)).sorted
      combines += 1
    }
    if (heap.isEmpty) -1 else combines
  }
}
