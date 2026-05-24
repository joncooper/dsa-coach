object Solution {
  def printOrder(jobs: Seq[Seq[Int]]): Seq[Int] = {
    jobs.sortBy(job => (-job(0), job(1))).map(_(1))
  }
}
