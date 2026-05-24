object Solution {
  def startStation(fuel: Seq[Int], cost: Seq[Int]): Int = {
    if (fuel.isEmpty) return 0
    var total = 0; var tank = 0; var start = 0
    for (index <- fuel.indices) { val diff = fuel(index) - cost(index); total += diff; tank += diff; if (tank < 0) { start = index + 1; tank = 0 } }
    if (total >= 0) start else -1
  }
}
