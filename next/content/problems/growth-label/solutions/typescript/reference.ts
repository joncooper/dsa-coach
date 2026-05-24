export function growthLabel(operations: number[]): string {
  if (operations.length < 2) return "unknown";
  let total = 0;
  for (let index = 0; index < operations.length - 1; index += 1) {
    if (operations[index] === 0) return "unknown";
    total += operations[index + 1] / operations[index];
  }
  const average = total / (operations.length - 1);
  if (average >= 0.75 && average <= 1.35) return "constant";
  if (average >= 1.55 && average <= 2.45) return "linear";
  if (average >= 3.1 && average <= 5.0) return "quadratic";
  return "unknown";
}
