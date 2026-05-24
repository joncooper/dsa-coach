object Solution {
  def reverseWords(text: String): String = {
    text.trim.split("\\s+").filter(_.nonEmpty).reverse.mkString(" ")
  }
}
