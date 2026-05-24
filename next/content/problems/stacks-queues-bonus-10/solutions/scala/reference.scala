object Solution {
  def slidingWindowMax(nums: Seq[Int], k: Int): Seq[Int] = {
    val deque = scala.collection.mutable.ArrayBuffer.empty[Int]
    val result = scala.collection.mutable.ArrayBuffer.empty[Int]
    for (right <- nums.indices) {
      while (deque.nonEmpty && deque.head <= right - k) deque.remove(0)
      while (deque.nonEmpty && nums(deque.last) <= nums(right)) deque.remove(deque.length - 1)
      deque.append(right)
      if (right >= k - 1) result.append(nums(deque.head))
    }
    result.toSeq
  }
}
