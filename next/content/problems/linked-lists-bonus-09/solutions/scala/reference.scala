object Solution {
  def oddEvenList(values: Seq[Int]): Seq[Int] = {
    val odds = scala.collection.mutable.ArrayBuffer.empty[Int]
    val evens = scala.collection.mutable.ArrayBuffer.empty[Int]
    for ((value, index) <- values.zipWithIndex) {
      if (index % 2 == 0) odds.append(value) else evens.append(value)
    }
    (odds ++ evens).toSeq
  }
}
