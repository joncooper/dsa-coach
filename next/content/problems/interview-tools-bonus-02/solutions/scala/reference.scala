object Solution {
  def unpairedNumber(nums: Seq[Int]): Int = {
    val unmatched = scala.collection.mutable.Set.empty[Int]
    for (value <- nums) if (unmatched(value)) unmatched.remove(value) else unmatched.add(value)
    unmatched.head
  }
}
