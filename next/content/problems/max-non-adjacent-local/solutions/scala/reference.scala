object Solution {
  def maxNonAdjacentLocal(nums: Seq[Int]): Int = {
    var skip = 0; var take = 0
    for (num <- nums) { val nextTake = skip + num; skip = math.max(skip, take); take = nextTake }
    math.max(math.max(skip, take), 0)
  }
}
