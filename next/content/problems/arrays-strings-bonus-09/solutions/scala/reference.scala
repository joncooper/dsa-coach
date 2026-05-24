object Solution {
  def dedupeSorted(nums: Seq[Int]): Seq[Int] = {
    val result = scala.collection.mutable.ArrayBuffer.empty[Int]
    for (num <- nums) {
      if (result.isEmpty || result.last != num) result.append(num)
    }
    result.toSeq
  }
}
