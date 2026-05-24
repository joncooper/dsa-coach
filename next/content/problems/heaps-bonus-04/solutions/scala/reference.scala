object Solution {
  def minConnectCost(ropes: Seq[Int]): Int = {
    var heap = ropes.sorted
    var cost = 0
    while (heap.length > 1) {
      val merged = heap.head + heap(1)
      cost += merged
      heap = (heap.drop(2) :+ merged).sorted
    }
    cost
  }
}
