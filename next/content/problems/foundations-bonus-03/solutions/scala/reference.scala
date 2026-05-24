object Solution {
  def secondLargest(values: Seq[Int]): Option[Int] = {
    var largest: Option[Int] = None
    var second: Option[Int] = None
    for (value <- values) {
      if (largest.isEmpty || value > largest.get) {
        if (largest.nonEmpty && value != largest.get) second = largest
        largest = Some(value)
      } else if (value != largest.get && (second.isEmpty || value > second.get)) {
        second = Some(value)
      }
    }
    second
  }
}
