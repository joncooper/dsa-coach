export function sumPositiveReadings(readings: number[]): number {
  let total = 0;
  for (const reading of readings) {
    if (reading > 0) total += reading;
  }
  return total;
}
