object Solution {
  def simplifyFolderSteps(steps: Seq[String]): String = {
    val stack = scala.collection.mutable.ArrayBuffer.empty[String]
    for (step <- steps) {
      if (step == "." || step == "") {
      } else if (step == "..") {
        if (stack.nonEmpty) stack.remove(stack.length - 1)
      } else {
        stack.append(step)
      }
    }
    "/" + stack.mkString("/")
  }
}
