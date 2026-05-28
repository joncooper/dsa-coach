object Solution {
  def cipher_checksum(inputText: String): Int = {
    var total = 0

    for (parts <- inputText.linesIterator.map(_.trim.split(" ")).filter(_.length == 3)) {
      val kind = parts(0)
      val code = parts(1)
      val status = parts(2)

      if (status == "ok" && code.exists(_.isLetter) && code.exists(_.isDigit)) {
        kind match {
          case "cargo" => total += code.takeWhile(_.isDigit).toIntOption.getOrElse(0)
          case "text" => total += code.count(_.isLetter)
          case "ledger" => total += code.filter(_.isDigit).map(_.asDigit).sum
          case _ =>
        }
      }
    }

    total
  }
}
