object Solution {
  def countTargetSumSubarrays(nums: Seq[Int], target: Int): Int = {
    val counts = scala.collection.mutable.Map(0 -> 1).withDefaultValue(0)
    var prefix = 0
    var total = 0
    for (num <- nums) {
      prefix += num
      total += counts(prefix - target)
      counts(prefix) = counts(prefix) + 1
    }
    total
  }
}
