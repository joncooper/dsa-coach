export function minCostStepsLocal(costs: number[]): number {
  let before = 0;
  let current = 0;
  for (let step = 2; step <= costs.length; step += 1) {
    const next = Math.min(current + costs[step - 1], before + costs[step - 2]);
    before = current;
    current = next;
  }
  return current;
}
