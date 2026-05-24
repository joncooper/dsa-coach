object Solution {
  def sumPositiveReadings(readings: Seq[Int]): Int = {
    readings.foldLeft(0) { (total, reading) =>
      if (reading > 0) total + reading else total
    }
  }
}
