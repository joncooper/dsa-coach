object Solution {
  def generateParenthesesLocal(n: Int): Seq[String] = {
    val result = scala.collection.mutable.ArrayBuffer.empty[String]
    val path = new StringBuilder
    def backtrack(opened: Int, closed: Int): Unit = {
      if (path.length == 2 * n) { result.append(path.toString); return }
      if (opened < n) { path.append('('); backtrack(opened + 1, closed); path.deleteCharAt(path.length - 1) }
      if (closed < opened) { path.append(')'); backtrack(opened, closed + 1); path.deleteCharAt(path.length - 1) }
    }
    backtrack(0, 0)
    result.toSeq
  }
}
