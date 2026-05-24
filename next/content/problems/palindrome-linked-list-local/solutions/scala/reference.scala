object Solution {
  def palindromeLinkedListLocal(values: Seq[Int]): Boolean = {
    var left = 0
    var right = values.length - 1
    while (left < right) {
      if (values(left) != values(right)) return false
      left += 1
      right -= 1
    }
    true
  }
}
