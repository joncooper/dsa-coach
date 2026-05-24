object Solution {
  def movingAverages(nums: Seq[Int], window: Int): Seq[Double] = {
    val queue = scala.collection.mutable.Queue.empty[Int]
    var total = 0
    val averages = scala.collection.mutable.ArrayBuffer.empty[Double]
    for (num <- nums) {
      queue.enqueue(num)
      total += num
      if (queue.length > window) total -= queue.dequeue()
      averages.append(total.toDouble / queue.length)
    }
    averages.toSeq
  }
}
