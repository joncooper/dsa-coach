object Solution {
  def peakIndex(nums: Seq[Int]): Int = {
    var lo = 0; var hi = nums.length - 1
    while (lo < hi) { val mid = (lo + hi) / 2; if (nums(mid) < nums(mid + 1)) lo = mid + 1 else hi = mid }
    lo
  }
}
