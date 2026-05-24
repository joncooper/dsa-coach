object Solution {
  def lruCache(capacity: Int, operations: Seq[Seq[String]]): Seq[String] = {
    val cache = scala.collection.mutable.LinkedHashMap.empty[String, String]
    val out = scala.collection.mutable.ArrayBuffer.empty[String]
    for (op <- operations if op.nonEmpty) {
      if (op.head == "get") {
        val key = op(1)
        cache.get(key) match {
          case Some(value) =>
            cache.remove(key)
            cache.put(key, value)
            out.append(value)
          case None => out.append("-1")
        }
      } else {
        val key = op(1)
        val value = op(2)
        cache.remove(key)
        cache.put(key, value)
        if (cache.size > capacity) {
          val oldest = cache.head._1
          cache.remove(oldest)
        }
      }
    }
    out.toSeq
  }
}
