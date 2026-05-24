object Solution {
  def restoreIpAddresses(digits: String): Seq[String] = {
    if (digits.isEmpty || !digits.forall(_.isDigit)) return Seq.empty
    val result = scala.collection.mutable.ArrayBuffer.empty[String]
    val parts = scala.collection.mutable.ArrayBuffer.empty[String]
    def valid(segment: String): Boolean = !(segment.length > 1 && segment.head == '0') && segment.toInt >= 0 && segment.toInt <= 255
    def backtrack(start: Int): Unit = {
      if (parts.length == 4) { if (start == digits.length) result.append(parts.mkString(".")); return }
      for (length <- 1 to 3 if start + length <= digits.length) { val segment = digits.substring(start, start + length); if (valid(segment)) { parts.append(segment); backtrack(start + length); parts.remove(parts.length - 1) } }
    }
    backtrack(0)
    result.toSeq.sorted
  }
}
