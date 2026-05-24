object Solution {
  def mixedReviewScore(results: Seq[Seq[Any]]): Int = {
    results.map { result => val difficulty = result(0).asInstanceOf[Int]; val passed = result(1).asInstanceOf[Boolean]; if (passed) difficulty else 0 }.sum
  }
}
