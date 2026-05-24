object Solution {
  def firstUnique(stream: Seq[String]): Seq[String] = {
    val counts = scala.collection.mutable.Map.empty[String, Int]
    val pending = scala.collection.mutable.ArrayBuffer.empty[String]
    val out = scala.collection.mutable.ArrayBuffer.empty[String]
    for (value <- stream) {
      val count = counts.getOrElse(value, 0) + 1
      counts.update(value, count)
      if (count == 1) pending.append(value)
      else {
        var index = pending.indexOf(value)
        while (index >= 0) {
          pending.remove(index)
          index = pending.indexOf(value)
        }
      }
      out.append(pending.headOption.getOrElse(""))
    }
    out.toSeq
  }
}
