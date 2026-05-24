object Solution {
  def rotateLeft(nums: Seq[Int], k: Int): Seq[Int] = {
    if (nums.isEmpty) Seq.empty
    else {
      val offset = k % nums.length
      nums.drop(offset) ++ nums.take(offset)
    }
  }
}
