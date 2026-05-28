object Solution {
  def solution(queries: Seq[Seq[String]]): Seq[String] = {
    val balances = scala.collection.mutable.Map.empty[String, Int]
    val spent = scala.collection.mutable.Map.empty[String, Int].withDefaultValue(0)
    val out = scala.collection.mutable.ArrayBuffer.empty[String]

    def renderTop(count: Int): String =
      if (count <= 0 || balances.isEmpty) ""
      else balances.keys.toSeq.map(name => name -> spent(name)).sortBy { case (name, total) => (-total, name) }.take(count).map { case (name, total) => s"$name($total)" }.mkString(",")

    def spend(account: String, amount: Int): Unit = spent(account) = spent(account) + amount

    for (query <- queries) query.head match {
      case "CREATE_ACCOUNT" =>
        val account = query(2)
        if (balances.contains(account)) out += "false"
        else {
          balances(account) = 0
          spent(account) = 0
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
            spend(account, amount)
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
            spend(source, amount)
            out += balances(source).toString
          case _ => out += ""
        }
      case "TOP_SPENDERS" => out += renderTop(query(2).toInt)
      case _ => out += ""
    }

    out.toSeq
  }
}
