object Solution {
  def valid_cipher_count(inputText: String): Int =
    inputText.linesIterator.count { raw =>
      val parts = raw.trim.split(" ")
      parts.length == 3 && parts(2) == "ok" && parts(1).exists(_.isLetter) && parts(1).exists(_.isDigit)
    }
}
