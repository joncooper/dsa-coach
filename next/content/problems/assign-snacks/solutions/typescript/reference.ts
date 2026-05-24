export function assignSnacks(appetites: number[], snacks: number[]): number {
  const needs = [...appetites].sort((a, b) => a - b);
  const sizes = [...snacks].sort((a, b) => a - b);
  let child = 0;
  for (const snack of sizes) {
    if (child < needs.length && snack >= needs[child]) child += 1;
  }
  return child;
}
