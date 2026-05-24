object Solution {
  def pairableRemainders(nums: Seq[Int], k: Int): Boolean = {
    if (nums.length % 2 == 1) return false
    val counts = scala.collection.mutable.Map.empty[Int, Int].withDefaultValue(0)
    for (num <- nums) {
      val remainder = ((num % k) + k) % k
      counts(remainder) = counts(remainder) + 1
    }
    for ((remainder, count) <- counts) {
      val complement = (k - remainder) % k
      if (remainder == complement) {
        if (count % 2 != 0) return false
      } else if (count != counts(complement)) return false
    }
    true
  }
}
