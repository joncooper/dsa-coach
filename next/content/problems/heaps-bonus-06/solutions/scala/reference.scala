object Solution {
  def kthSmallestPairSum(a: Seq[Int], b: Seq[Int], k: Int): Int = {
    (for (x <- a; y <- b) yield x + y).sorted.apply(k - 1)
  }
}
