object Solution {
  def firstRepeatedValue(values: Seq[Int]): Option[Int] = {
    val seen = scala.collection.mutable.Set.empty[Int]
    values.find { value =>
      val repeated = seen.contains(value)
      seen.add(value)
      repeated
    }
  }
}
