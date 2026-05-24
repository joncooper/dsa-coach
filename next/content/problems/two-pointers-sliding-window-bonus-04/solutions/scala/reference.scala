object Solution {
  def isLoosePalindrome(text: String): Boolean = {
    var left = 0
    var right = text.length - 1
    while (left < right) {
      while (left < right && !text.charAt(left).isLetterOrDigit) left += 1
      while (left < right && !text.charAt(right).isLetterOrDigit) right -= 1
      if (text.charAt(left).toLower != text.charAt(right).toLower) return false
      left += 1
      right -= 1
    }
    true
  }
}
