object Solution {
  def count_strict_records(inputText: String): Int = {
    val required = Set("id", "name", "age", "grade", "cohort")
    val seasons = Set("fall", "winter", "spring", "summer")
    val grades = Set("A", "B", "C", "D", "F")

    inputText.split("\n\n").count { block =>
      val fields = block.split("\\s+").flatMap { token =>
        val colon = token.indexOf(':')
        if (colon >= 0) Some(token.substring(0, colon) -> token.substring(colon + 1)) else None
      }.toMap

      required.subsetOf(fields.keySet) &&
        fields("id").matches("\\d{9}") &&
        fields("name").matches("[A-Za-z-]{1,32}") &&
        fields("age").forall(_.isDigit) &&
        fields("age").toInt >= 16 &&
        fields("age").toInt <= 99 &&
        grades.contains(fields("grade")) &&
        seasons.contains(fields("cohort"))
    }
  }
}
