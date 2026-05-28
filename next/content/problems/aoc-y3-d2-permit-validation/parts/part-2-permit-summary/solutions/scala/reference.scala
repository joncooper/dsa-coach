object Solution {
  def permit_counts_by_stage(inputText: String): Map[String, Any] = {
    val counts = scala.collection.mutable.Map("main" -> 0, "side" -> 0, "late" -> 0)

    for (parts <- inputText.linesIterator.map(_.trim.split(" ")).filter(_.length == 3)) {
      val stage = parts(0)
      if (counts.contains(stage) && isValidPermit(parts(1), parts(2))) counts(stage) += 1
    }

    Map("main" -> counts("main"), "side" -> counts("side"), "late" -> counts("late"))
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
