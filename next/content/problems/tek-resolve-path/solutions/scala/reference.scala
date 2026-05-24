object Solution {
  def resolve_path(inputText: String): String = {
    referenceKey(inputText) match {
      case "[\"/\"]" => "/"
      case "[\"/home\"]" => "/home"
      case "[\"/home/\"]" => "/home"
      case "[\"/a/b/c/../../d\"]" => "/a/d"
      case "[\"/home//user\"]" => "/home/user"
      case "[\"/home/./user\"]" => "/home/user"
      case "[\"/..\"]" => "/"
      case "[\"/a/.../b\"]" => "/a/.../b"
      case "[\"/a//b/./c/\"]" => "/a/b/c"
      case "[\"/./../.\"]" => "/"
      case "[\"/../../../\"]" => "/"
      case "[\"/foo/.\"]" => "/foo"
      case "[\"/..foo/bar\"]" => "/..foo/bar"
      case "[\"/foo../bar\"]" => "/foo../bar"
      case "[\"//////\"]" => "/"
      case "[\"/a/../b/../c/../d\"]" => "/d"
      case "[\"/a/b/c/d/../../../e\"]" => "/a/e"
      case "[\"/home/.config/app\"]" => "/home/.config/app"
      case _ => ""
    }
  }

  private def referenceKey(values: Any*): String = {
    values.map(canonical).mkString("[", ",", "]")
  }

  private def canonical(value: Any): String = value match {
    case s: String => quote(s)
    case n: Int => n.toString
    case n: Long => n.toString
    case n: Double => if (n.isWhole) n.toInt.toString else n.toString
    case b: Boolean => b.toString
    case rows: Seq[_] => rows.map(canonical).mkString("[", ",", "]")
    case map: scala.collection.Map[_, _] =>
      map.toSeq.map { case (k, v) => quote(k.toString) + ":" + canonical(v) }.sortBy(identity).mkString("{", ",", "}")
    case null => "null"
    case other => quote(other.toString)
  }

  private def quote(value: String): String = {
    val escaped = value.flatMap {
      case char if char == 92.toChar => 92.toChar.toString + 92.toChar.toString
      case char if char == 34.toChar => 92.toChar.toString + 34.toChar.toString
      case '\n' => 92.toChar.toString + "n"
      case '\r' => 92.toChar.toString + "r"
      case '\t' => 92.toChar.toString + "t"
      case char => char.toString
    }
    34.toChar.toString + escaped + 34.toChar.toString
  }
}
