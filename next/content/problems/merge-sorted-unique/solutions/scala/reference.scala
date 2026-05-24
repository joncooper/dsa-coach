object Solution {
  def mergeSortedUnique(a: Seq[Int], b: Seq[Int]): Seq[Int] = {
    val result = scala.collection.mutable.ArrayBuffer.empty[Int]
    var i = 0
    var j = 0
    while (i < a.length || j < b.length) {
      val value = if (j >= b.length || (i < a.length && a(i) <= b(j))) {
        val current = a(i)
        i += 1
        current
      } else {
        val current = b(j)
        j += 1
        current
      }
      if (result.isEmpty || result.last != value) result.append(value)
    }
    result.toSeq
  }
}
