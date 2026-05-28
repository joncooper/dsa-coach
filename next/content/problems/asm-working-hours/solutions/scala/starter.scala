object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    val workers = scala.collection.mutable.Map.empty[String, Any]
    val result = scala.collection.mutable.ArrayBuffer.empty[String]

    for (query <- queries) query.head match {
      case "ADD_WORKER" => result += ""
      case "REGISTER" => result += ""
      case "GET" => result += ""
      case "TOP_N_WORKERS" => result += ""
      case "PROMOTE" => result += ""
      case "CALC_SALARY" => result += ""
      case "SET_DOUBLE_PAY" => result += ""
      case _ => result += ""
    }

    workers.clear()
    result.toSeq
  }
}
