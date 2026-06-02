export function recentSpendTotals(events: number[][], window: number): number[] {
  let left = 0;
  let runningTotal = 0;
  const totals: number[] = [];

  for (const [timestamp, amount] of events) {
    runningTotal += amount;

    while (events[left][0] < timestamp - window) {
      runningTotal -= events[left][1];
      left += 1;
    }

    totals.push(runningTotal);
  }

  return totals;
}
