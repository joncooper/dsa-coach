object Solution {
  def lisLengthLocal(nums: Seq[Int]): Int = {
    val tails = scala.collection.mutable.ArrayBuffer.empty[Int]
    for (num <- nums) { var left = 0; var right = tails.length; while (left < right) { val mid = (left + right) / 2; if (tails(mid) < num) left = mid + 1 else right = mid }; if (left == tails.length) tails.append(num) else tails(left) = num }
    tails.length
  }
}
