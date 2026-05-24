object Solution {
  def hotPotato(players: Seq[Any], passes: Int): Any = {
    val queue = scala.collection.mutable.Queue(players: _*)
    while (queue.length > 1) {
      for (_ <- 0 until passes) queue.enqueue(queue.dequeue())
      queue.dequeue()
    }
    queue.front
  }
}
