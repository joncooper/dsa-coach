object Solution {
  def lastStoneWeight(stones: Seq[Int]): Int = {
    var heap = stones.sorted
    while (heap.length > 1) {
      val y = heap.last; val x = heap(heap.length - 2)
      heap = heap.dropRight(2)
      if (x != y) heap = (heap :+ (y - x)).sorted
    }
    heap.headOption.getOrElse(0)
  }
}
