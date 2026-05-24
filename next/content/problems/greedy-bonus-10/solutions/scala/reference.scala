object Solution {
  def largestConcatenation(nums: Seq[Int]): String = {
    if (nums.isEmpty) return "0"
    val pieces = nums.map(_.toString).sortWith((a, b) => a + b > b + a)
    val result = pieces.mkString
    if (result.forall(_ == '0')) "0" else result
  }
}
