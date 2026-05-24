object Solution {
  def topKScores(scores: Seq[Int], k: Int): Seq[Int] = {
    if (k <= 0) Seq.empty else scores.sorted(Ordering.Int.reverse).take(k)
  }
}
