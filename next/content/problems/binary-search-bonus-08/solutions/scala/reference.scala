object Solution {
  def splitArrayMinLargest(nums: Seq[Int], k: Int): Int = {
    def partsNeeded(limit: Int): Int = { var parts = 1; var total = 0; for (num <- nums) { if (total + num > limit) { parts += 1; total = 0 }; total += num }; parts }
    var left = nums.max; var right = nums.sum
    while (left < right) { val mid = (left + right) / 2; if (partsNeeded(mid) <= k) right = mid else left = mid + 1 }
    left
  }
}
