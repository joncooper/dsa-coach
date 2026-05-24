object Solution {
  def reverseVowels(text: String): String = {
    val vowels = Set('a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U')
    val chars = text.toCharArray
    var left = 0; var right = chars.length - 1
    while (left < right) { if (!vowels(chars(left))) left += 1 else if (!vowels(chars(right))) right -= 1 else { val temp = chars(left); chars(left) = chars(right); chars(right) = temp; left += 1; right -= 1 } }
    chars.mkString
  }
}
