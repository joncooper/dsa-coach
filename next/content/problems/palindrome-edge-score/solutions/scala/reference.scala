object Solution {
  def palindromeEdgeScore(text: String): Int = {
    var left = 0
    var right = text.length - 1
    var score = 0
    while (left < right && text.charAt(left) == text.charAt(right)) {
      score += 1
      left += 1
      right -= 1
    }
    score
  }
}
