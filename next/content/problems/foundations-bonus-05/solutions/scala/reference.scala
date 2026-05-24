object Solution {
  def countVowels(text: String): Int = {
    val vowels = Set('a', 'e', 'i', 'o', 'u')
    text.toLowerCase.count(vowels.contains)
  }
}
