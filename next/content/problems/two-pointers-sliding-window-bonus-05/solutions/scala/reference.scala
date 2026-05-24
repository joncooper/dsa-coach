object Solution {
  def windowAverages(nums: Seq[Int], k: Int): Seq[Double] = {
    if (k <= 0 || k > nums.length) return Seq.empty
    var total = nums.take(k).sum
    val result = scala.collection.mutable.ArrayBuffer(total.toDouble / k)
    for (right <- k until nums.length) {
      total += nums(right) - nums(right - k)
      result.append(total.toDouble / k)
    }
    result.toSeq
  }
}
