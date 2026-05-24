object Solution {
  def runningMaximum(nums: List[Int]): List[Int] = {
    nums.scanLeft(Int.MinValue)(math.max).tail
  }
}
