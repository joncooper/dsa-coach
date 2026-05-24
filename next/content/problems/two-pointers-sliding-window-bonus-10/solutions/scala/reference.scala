object Solution {
  def mergeSorted(a: Seq[Int], b: Seq[Int]): Seq[Int] = {
    val result = scala.collection.mutable.ArrayBuffer.empty[Int]
    var i = 0
    var j = 0
    while (i < a.length && j < b.length) {
      if (a(i) <= b(j)) {
        result.append(a(i))
        i += 1
      } else {
        result.append(b(j))
        j += 1
      }
    }
    result.toSeq ++ a.drop(i) ++ b.drop(j)
  }
}
