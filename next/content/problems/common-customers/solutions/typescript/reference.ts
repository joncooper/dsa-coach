export function commonCustomers(morning: number[], evening: number[]): number {
  const seen = new Set(morning);
  let count = 0;
  for (const customer of new Set(evening)) {
    if (seen.has(customer)) count += 1;
  }
  return count;
}
