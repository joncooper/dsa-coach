object Solution {
  private val SystemOwner = "$system"
  private case class FileInfo(var size: Int, owner: String, var originalSize: Int, var compressed: Boolean = false)
  private case class UserInfo(limit: Int, var used: Int = 0)

  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    val files = scala.collection.mutable.Map.empty[String, FileInfo]
    val users = scala.collection.mutable.Map.empty[String, UserInfo]
    val out = scala.collection.mutable.ArrayBuffer.empty[String]

    def render(rows: Iterable[(String, Int)]): String =
      rows.toSeq.sortBy { case (name, size) => (-size, name) }.map { case (name, size) => s"$name($size)" }.mkString(",")

    def evictFor(user: String, size: Int): Unit = {
      val info = users(user)
      val owned = files.collect { case (name, file) if file.owner == user => name -> file.size }.toSeq.sortBy { case (name, fileSize) => (-fileSize, name) }
      for ((name, fileSize) <- owned if info.used + size > info.limit) {
        files.remove(name)
        info.used -= fileSize
      }
    }

    for (query <- queries) query.head match {
      case "ADD_FILE" =>
        val name = query(1)
        val size = query(2).toInt
        if (files.contains(name)) out += "false"
        else {
          files(name) = FileInfo(size, SystemOwner, size)
          out += "true"
        }
      case "GET_FILE_SIZE" => out += files.get(query(1)).map(_.size.toString).getOrElse("")
      case "COPY_FILE" =>
        files.get(query(1)) match {
          case Some(source) =>
            files(query(2)) = FileInfo(source.size, SystemOwner, source.size)
            out += "true"
          case None => out += "false"
        }
      case "FIND_BY_PREFIX" => out += render(files.collect { case (name, file) if name.startsWith(query(1)) => name -> file.size })
      case "FIND_BY_SUFFIX" => out += render(files.collect { case (name, file) if name.endsWith(query(1)) => name -> file.size })
      case "ADD_USER" =>
        val user = query(1)
        if (users.contains(user)) out += "false"
        else {
          users(user) = UserInfo(query(2).toInt)
          out += "true"
        }
      case "ADD_FILE_BY" =>
        val user = query(1)
        val name = query(2)
        val size = query(3).toInt
        users.get(user) match {
          case None => out += "false"
          case Some(info) if files.contains(name) || size > info.limit => out += "false"
          case Some(info) =>
            if (info.used + size > info.limit) evictFor(user, size)
            files(name) = FileInfo(size, user, size)
            info.used += size
            out += "true"
        }
      case "COMPRESS_FILE" =>
        val user = query(1)
        val name = query(2)
        files.get(name) match {
          case Some(file) if file.owner == user && !file.compressed =>
            val newSize = file.size / 2
            users.get(user).foreach(_.used -= file.size - newSize)
            file.originalSize = file.size
            file.size = newSize
            file.compressed = true
            out += newSize.toString
          case _ => out += ""
        }
      case "DECOMPRESS_FILE" =>
        val user = query(1)
        val name = query(2)
        files.get(name) match {
          case Some(file) if file.owner == user && file.compressed =>
            val delta = file.originalSize - file.size
            users.get(user) match {
              case Some(info) if info.used + delta > info.limit => out += ""
              case info =>
                info.foreach(_.used += delta)
                file.size = file.originalSize
                file.compressed = false
                out += file.size.toString
            }
          case _ => out += ""
        }
      case _ => out += ""
    }

    out.toSeq
  }
}
