object Solution {
  def anagramBucketSizes(words: Seq[String]): Seq[Int] = {
    val buckets = scala.collection.mutable.Map.empty[String, Int].withDefaultValue(0)
    for (word <- words) {
      val key = word.sorted
      buckets(key) = buckets(key) + 1
    }
    buckets.values.toSeq.sorted
  }
}
