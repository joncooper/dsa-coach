object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    val balances = scala.collection.mutable.Map.empty[String, Int]
    val out = scala.collection.mutable.ArrayBuffer.empty[String]

    for (query <- queries) query.head match {
      case "CREATE_ACCOUNT" =>
        val account = query(2)
        if (balances.contains(account)) out += "false"
        else {
          balances(account) = 0
          out += "true"
        }
      case "DEPOSIT" =>
        balances.get(query(2)) match {
          case Some(balance) =>
            balances(query(2)) = balance + query(3).toInt
            out += balances(query(2)).toString
          case None => out += ""
        }
      case "WITHDRAW" =>
        val account = query(2)
        val amount = query(3).toInt
        balances.get(account) match {
          case Some(balance) if balance >= amount =>
            balances(account) = balance - amount
            out += balances(account).toString
          case _ => out += ""
        }
      case "TRANSFER" =>
        val source = query(2)
        val target = query(3)
        val amount = query(4).toInt
        (balances.get(source), balances.get(target)) match {
          case (Some(sourceBalance), Some(targetBalance)) if source != target && sourceBalance >= amount =>
            balances(source) = sourceBalance - amount
            balances(target) = targetBalance + amount
            out += balances(source).toString
          case _ => out += ""
        }
      case _ => out += ""
    }

    out.toSeq
  }
}
