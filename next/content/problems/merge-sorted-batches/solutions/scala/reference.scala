object Solution {
  def mergeSortedBatches(batches: Seq[Seq[Int]]): Seq[Int] = {
    batches.flatten.sorted
  }
}
