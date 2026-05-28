object Solution {
  def count_complete_records(inputText: String): Int = {
    val required = Set("id", "name", "age", "grade", "cohort")

    inputText.split("\n\n").count { block =>
      val keys = block.split("\\s+").flatMap { token =>
        val colon = token.indexOf(':')
        if (colon >= 0) Some(token.substring(0, colon)) else None
      }.toSet
      keys.nonEmpty && required.subsetOf(keys)
    }
  }
}
