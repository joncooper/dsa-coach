object Solution {
  def firstUniqueToken(tokens: Seq[String]): String = {
    val counts = scala.collection.mutable.Map.empty[String, Int].withDefaultValue(0)
    for (token <- tokens) counts(token) = counts(token) + 1
    tokens.find(token => counts(token) == 1).getOrElse("")
  }
}
