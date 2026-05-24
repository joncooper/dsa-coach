object Solution {
  def mergeTwoLinkedLists(a: Seq[Int], b: Seq[Int]): Seq[Int] = {
    var left = 0
    var right = 0
    val merged = scala.collection.mutable.ArrayBuffer.empty[Int]
    while (left < a.length && right < b.length) {
      if (a(left) <= b(right)) {
        merged.append(a(left))
        left += 1
      } else {
        merged.append(b(right))
        right += 1
      }
    }
    merged.appendAll(a.drop(left))
    merged.appendAll(b.drop(right))
    merged.toSeq
  }
}
