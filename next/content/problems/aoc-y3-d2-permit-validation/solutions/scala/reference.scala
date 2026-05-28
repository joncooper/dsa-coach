object Solution {
  def count_valid_permits(inputText: String): Int =
    inputText.linesIterator.count { raw =>
      val parts = raw.trim.split(" ")
      parts.length == 3 && isValidPermit(parts(1), parts(2))
    }

  private def isValidPermit(licenseValue: String, expires: String): Boolean = {
    val groups = licenseValue.split("-")
    groups.length == 3 &&
      groups(0).length == 3 &&
      groups(1).length == 2 &&
      groups(2).length == 4 &&
      groups.forall(_.forall(_.isDigit)) &&
      expires.matches("\\d{4}") &&
      expires.toInt >= 2025
  }
}
