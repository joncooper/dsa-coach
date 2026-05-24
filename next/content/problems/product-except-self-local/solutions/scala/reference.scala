object Solution {
  def productExceptSelfLocal(nums: Seq[Int]): Seq[Int] = {
    val result = Array.fill(nums.length)(1)
    var prefix = 1
    for (index <- nums.indices) {
      result(index) = prefix
      prefix *= nums(index)
    }
    var suffix = 1
    for (index <- nums.indices.reverse) {
      result(index) *= suffix
      suffix *= nums(index)
    }
    result.toSeq
  }
}
