object Solution {
  def groupByFirstLetter(words: Seq[String]): Map[String, Seq[String]] = {
    val groups = scala.collection.mutable.Map.empty[String, scala.collection.mutable.ArrayBuffer[String]]
    for (word <- words if word.nonEmpty) {
      val key = word.charAt(0).toString
      groups.getOrElseUpdate(key, scala.collection.mutable.ArrayBuffer.empty[String]).append(word)
    }
    groups.toSeq.sortBy(_._1).map { case (key, values) => key -> values.toSeq }.toMap
  }
}
